import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';
import del from 'del';
import { projectRootDir } from '../config';
import { directoryExists } from '../utils';

const sampleDirName = 'demo';
export const startSandBox = async(): Promise<void> => {
  const packageJson = JSON.parse(await fs.readFile(`${projectRootDir}/package.json`, 'utf-8')) as { name: string; version: string };
  const packageName = String(packageJson.name);
  const packageVersion = String(packageJson.version);
  const tempDir = path.resolve(`${String(process.env.USERPROFILE)}/AppData/Local/Temp`);
  const wsbDirPath = path.resolve(`${tempDir}/${String(packageJson.name)}`);
  const wsbPath = path.resolve(`${wsbDirPath}/sandbox.wsb`);

  if (directoryExists(wsbDirPath)) {
    await del(wsbDirPath, { force: true });
  }
  await fs.mkdir(wsbDirPath);
  await fs.writeFile(wsbPath, `
    <Configuration>
      <MappedFolders>
          <MappedFolder>
              <HostFolder>${wsbDirPath}</HostFolder>
          </MappedFolder>
      </MappedFolders>
      <LogonCommand>
        <Command>powershell -executionpolicy unrestricted -command "start powershell { -noexit -file C:\\Users\\WDAGUtilityAccount\\Desktop\\${packageName}\\installer.ps1 }"</Command>
      </LogonCommand>
    </Configuration>
  `);

  await fs.copyFile(`${projectRootDir}/${packageName}-${packageVersion}.vsix`, `${wsbDirPath}/${packageName}.vsix`);
  await fs.copy(`${projectRootDir}/${sampleDirName}`, `${wsbDirPath}/${sampleDirName}`);
  const installerPath = `${wsbDirPath}/installer.ps1`;
  await fs.writeFile(installerPath, `
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:ChocolateyInstall = Convert-Path "$((Get-Command choco).path)\\..\\.."
    Import-Module "$env:ChocolateyInstall\\helpers\\chocolateyProfile.psm1"

    choco install vscode -y
    choco install autohotkey -y

    refreshenv
    code --install-extension slevesque.vscode-autohotkey
    code --install-extension C:\\Users\\WDAGUtilityAccount\\Desktop\\${packageName}\\${packageName}.vsix
    code C:\\Users\\WDAGUtilityAccount\\Desktop\\${packageName}\\${sampleDirName}
    exit
  `);
  spawn('WindowsSandBox', [ wsbPath ], { detached: true });
};
