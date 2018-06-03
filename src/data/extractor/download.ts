import * as fs from "fs";
import * as path from "path";
import * as requestPromise from "request-promise-native";

export async function getPathToJar(
  tempdir: string,
  currentversion: string
): Promise<JarInfo> {
  if (!!mcLangSettings.data.customJar) {
    return { jarPath: mcLangSettings.data.customJar, version: "" };
  } else {
    return downloadJar(currentversion, tempdir);
  }
}

export async function downloadJar(
  currentversion: string,
  tmpDirName: string
): Promise<JarInfo> {
  const versionInfo = await getLatestVersionInfo();
  if (versionInfo.id !== currentversion) {
    const singleVersion: SingleVersionInformation = await requestPromise(
      versionInfo.url,
      {
        json: true
      }
    ).promise();
    const jarPath = path.join(
      tmpDirName,
      `minecraft-function-${versionInfo.id}.jar`
    );
    const requestPromised = requestPromise(singleVersion.downloads.server.url);
    requestPromised.pipe(fs.createWriteStream(jarPath));
    await Promise.resolve(requestPromised);
    return { jarPath, version: versionInfo.id };
  } else {
    throw new Error(
      "Downloading new global data not needed as current version is the same as the latest version."
    );
  }
}

export interface JarInfo {
  jarPath: string;
  version: string;
}

//#region Version Manifest Usage
interface SingleVersionInformation {
  downloads: {
    server: {
      sha1: string;
      size: number;
      url: string;
    };
  };
}

async function getLatestVersionInfo(): Promise<VersionInfo> {
  const manifest: VersionsManifest = await requestPromise(
    "https://launchermeta.mojang.com/mc/game/version_manifest.json",
    { json: true }
  ).promise();
  const version = findVersion(getVersionId(manifest), manifest);
  return version;
}

function getVersionId(manifest: VersionsManifest): string {
  if (mcLangSettings.data.snapshots) {
    return manifest.latest.snapshot;
  } else {
    return manifest.latest.release;
  }
}

function findVersion(version: string, manifest: VersionsManifest): VersionInfo {
  return manifest.versions.find(
    verInfo => verInfo.id === version
  ) as VersionInfo;
}

interface VersionInfo {
  id: string;
  releaseTime: string;
  time: string;
  type: "snapshot" | "release";
  url: string;
}

interface VersionsManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: VersionInfo[];
}
//#endregion
