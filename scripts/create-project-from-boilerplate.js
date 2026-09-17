#!/usr/bin/env node

/**
 * Scaffolds a new Expo project from this boilerplate, or resumes a failed setup.
 *
 * Usage (from boilerplate root):
 *   yarn create-project
 *   node scripts/create-project-from-boilerplate.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const IS_WINDOWS = process.platform === "win32";
const BOILERPLATE_ROOT = path.resolve(__dirname, "..");
// Create sibling projects next to this boilerplate folder (same parent directory).
const PROJECTS_DIR = path.dirname(BOILERPLATE_ROOT);
const SETUP_STATE_FILE = ".boilerplate-setup-state.json";
const VALIDATED_MARKER_FILE = ".boilerplate-validated";
const DEFAULT_EXPO_SDK = "54";

const CONFIG_FILES = [
  ".env.example",
  "tsconfig.json",
  "babel.config.js",
  "metro.config.js",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.json",
  "eslint.config.js",
  ".prettierrc",
  ".prettierrc.js",
  ".prettierrc.json",
];

const ROOT_FILES_TO_COPY = [
  "App.tsx",
  "index.ts",
  "firebase.json",
  "eas.json",
  ".gitignore",
];

const ROOT_FOLDERS_TO_COPY = [".agents", ".cursor", "plugins"];

const APP_ICON_FILES = [
  "app_icon.png",
  "app_logo.png",
  "favicon.png",
  "android-icon-foreground.png",
  "android-icon-background.png",
  "android-icon-monochrome.png",
];

const BOILERPLATE_MARKERS = [
  "@gorhom/bottom-sheet",
  "zustand",
  "@tanstack/react-query",
];

const EXPO_INSTALL_CHUNK_SIZE = 25;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function log(message) {
  console.log(message);
}

function step(message) {
  console.log(`\n▶ ${message}`);
}

function skip(message) {
  console.log(`⏭️  ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function fail(message) {
  console.error(`❌ ${message}`);
}

/**
 * Run shell commands cross-platform.
 * On Windows, yarn/npx are `.cmd` shims and need `shell: true`.
 */
function run(command, options = {}) {
  const { cwd = process.cwd(), silent = false } = options;
  log(silent ? "" : `$ ${command}`);
  execSync(command, {
    cwd,
    stdio: silent ? "pipe" : "inherit",
    env: process.env,
    shell: true,
  });
}

function runCapture(command, options = {}) {
  const { cwd = process.cwd() } = options;
  return execSync(command, {
    cwd,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  }).trim();
}

function ensureProjectsDir() {
  // Parent of the boilerplate (often already exists). Never mkdir a drive root
  // like `D:\` — Windows throws EPERM even with recursive: true.
  if (fs.existsSync(PROJECTS_DIR)) {
    if (!fs.statSync(PROJECTS_DIR).isDirectory()) {
      throw new Error(
        `Projects path exists but is not a directory: ${PROJECTS_DIR}`,
      );
    }
    return;
  }

  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

/** Quote a filesystem path for the platform shell (cmd.exe / sh). */
function quoteShellPath(filePath) {
  if (IS_WINDOWS) {
    return `"${String(filePath).replace(/"/g, '""')}"`;
  }
  return `'${String(filePath).replace(/'/g, `'\\''`)}'`;
}

function ask(question, defaultValue) {
  const suffix =
    defaultValue !== undefined && defaultValue !== ""
      ? ` (${defaultValue})`
      : "";

  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed || defaultValue || "");
    });
  });
}

function askYesNo(question, defaultYes = true) {
  const hint = defaultYes ? "Y/n" : "y/N";
  return ask(`${question} [${hint}]`, defaultYes ? "y" : "n").then((answer) => {
    const normalized = answer.toLowerCase();
    if (!normalized) return defaultYes;
    return normalized === "y" || normalized === "yes";
  });
}

function askChoice(question, choices) {
  console.log(`\n${question}`);
  choices.forEach((choice, index) => {
    console.log(`  ${index + 1}. ${choice.label}`);
  });

  return ask("Enter number").then((answer) => {
    const index = Number.parseInt(answer, 10) - 1;
    if (Number.isNaN(index) || index < 0 || index >= choices.length) {
      throw new Error("Invalid selection.");
    }
    return choices[index].value;
  });
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toScheme(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function toPackageSegment(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function defaultBundleId(folderName) {
  const segment = toPackageSegment(folderName) || "app";
  return `com.company.${segment}`;
}

function validateFolderName(folderName) {
  if (!folderName) {
    throw new Error("Folder name is required.");
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(folderName)) {
    throw new Error(
      "Folder name may only contain letters, numbers, dots, underscores, and hyphens.",
    );
  }

  if (folderName === "." || folderName === "..") {
    throw new Error("Invalid folder name.");
  }
}

function validateSlug(slug) {
  if (!slug) {
    throw new Error("Slug is required.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "Slug must be URL-safe: lowercase letters, numbers, and hyphens only.",
    );
  }
}

function validateScheme(scheme) {
  if (!scheme) {
    throw new Error("Scheme is required for deep linking.");
  }

  if (!/^[a-z][a-z0-9+.-]*$/.test(scheme)) {
    throw new Error(
      "Scheme must start with a letter and contain only lowercase letters, numbers, +, ., or -.",
    );
  }
}

function validateBundleId(bundleId) {
  if (!bundleId) {
    throw new Error("Bundle identifier is required.");
  }

  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/.test(bundleId)) {
    throw new Error("Bundle identifier must look like com.company.appname.");
  }
}

/**
 * Resolves a user SDK input ("54", "latest", etc.) to a major version string.
 * @param {string} sdkInput
 * @returns {string}
 */
function resolveExpoSdkMajor(sdkInput) {
  const normalized = String(sdkInput ?? DEFAULT_EXPO_SDK)
    .trim()
    .toLowerCase();

  if (!normalized) {
    return DEFAULT_EXPO_SDK;
  }

  if (normalized === "latest") {
    try {
      const version = runCapture("npm view expo version");
      const sdkMajor = version.split(".")[0];
      if (!sdkMajor || !/^\d+$/.test(sdkMajor)) {
        throw new Error(`Unexpected expo version: ${version}`);
      }
      return sdkMajor;
    } catch (error) {
      warn(
        `Could not resolve latest Expo SDK (${error.message}). Falling back to SDK ${DEFAULT_EXPO_SDK}.`,
      );
      return DEFAULT_EXPO_SDK;
    }
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error(
      `Invalid Expo SDK version "${sdkInput}". Enter a number (e.g. ${DEFAULT_EXPO_SDK}) or "latest".`,
    );
  }

  return normalized;
}

/**
 * Reads the Expo major version from the boilerplate package.json.
 * @returns {string}
 */
function getBoilerplateExpoMajor() {
  const packageJson = readJsonFile(path.join(BOILERPLATE_ROOT, "package.json"));
  const expoVersion = packageJson?.dependencies?.expo;

  if (!expoVersion) {
    throw new Error(
      "Boilerplate package.json is missing dependencies.expo.",
    );
  }

  const major = String(expoVersion)
    .replace(/^[^\d]*/, "")
    .split(".")[0];

  if (!major || !/^\d+$/.test(major)) {
    throw new Error(
      `Could not parse Expo major version from "${expoVersion}".`,
    );
  }

  return major;
}

function getExpoTemplate(sdkInput) {
  const sdkMajor = resolveExpoSdkMajor(sdkInput);
  return {
    sdkMajor,
    template: `blank-typescript@sdk-${sdkMajor}`,
  };
}

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getSetupStatePath(targetRoot) {
  return path.join(targetRoot, SETUP_STATE_FILE);
}

function loadSetupState(targetRoot) {
  return readJsonFile(getSetupStatePath(targetRoot));
}

function saveSetupState(targetRoot, config, completedSteps) {
  const state = {
    version: 1,
    updatedAt: new Date().toISOString(),
    config,
    completedSteps: [...completedSteps],
  };

  fs.writeFileSync(
    getSetupStatePath(targetRoot),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function isDirectory(targetPath) {
  return fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();
}

function isExpoProject(targetRoot) {
  const packageJson = readJsonFile(path.join(targetRoot, "package.json"));
  if (!packageJson) {
    return false;
  }

  return Boolean(
    packageJson.dependencies?.expo || packageJson.devDependencies?.expo,
  );
}

function hasBoilerplateDeps(targetRoot) {
  const packageJson = readJsonFile(path.join(targetRoot, "package.json"));
  if (!packageJson?.dependencies) {
    return false;
  }

  return BOILERPLATE_MARKERS.some((dep) => packageJson.dependencies[dep]);
}

function hasGitCommit(targetRoot) {
  const gitDir = path.join(targetRoot, ".git");
  if (!fs.existsSync(gitDir)) {
    return false;
  }

  try {
    runCapture("git rev-parse HEAD", { cwd: targetRoot });
    return true;
  } catch {
    return false;
  }
}

function getStepChecks(targetRoot, config) {
  const appJson = readJsonFile(path.join(targetRoot, "app.json"));
  const expo = appJson?.expo;
  const packageJson = readJsonFile(path.join(targetRoot, "package.json"));

  return {
    init_expo: () => isExpoProject(targetRoot),
    copy_src: () =>
      fs.existsSync(path.join(targetRoot, "src", "navigation")) &&
      fs.existsSync(path.join(targetRoot, "src", "components")),
    copy_root_files: () => fs.existsSync(path.join(targetRoot, "App.tsx")),
    copy_agent_tooling: () =>
      ROOT_FOLDERS_TO_COPY.every((folder) => {
        const sourcePath = path.join(BOILERPLATE_ROOT, folder);
        if (!fs.existsSync(sourcePath)) {
          return true;
        }
        return fs.existsSync(path.join(targetRoot, folder));
      }),
    copy_config: () =>
      CONFIG_FILES.some((file) => fs.existsSync(path.join(targetRoot, file))),
    write_app_json: () =>
      Boolean(expo?.slug && expo?.scheme && expo?.ios?.bundleIdentifier),
    merge_package_json: () => packageJson?.scripts?.lint === "expo lint",
    yarn_install: () => fs.existsSync(path.join(targetRoot, "node_modules")),
    expo_install_deps: () => hasBoilerplateDeps(targetRoot),
    expo_install_fix: () =>
      fs.existsSync(path.join(targetRoot, "node_modules", "expo")),
    validate_install: () =>
      fs.existsSync(path.join(targetRoot, VALIDATED_MARKER_FILE)),
    prebuild: () =>
      fs.existsSync(path.join(targetRoot, "android")) &&
      fs.existsSync(path.join(targetRoot, "ios")),
    patch_ios_podfile: () => {
      const podfilePath = path.join(targetRoot, "ios", "Podfile");
      if (!fs.existsSync(podfilePath)) {
        return false;
      }
      const contents = fs.readFileSync(podfilePath, "utf8");
      return contents.includes("$RNFirebaseDisableSPM");
    },
    pod_install: () =>
      fs.existsSync(path.join(targetRoot, "ios", "Podfile.lock")) ||
      fs.existsSync(path.join(targetRoot, "ios", "Pods", "Manifest.lock")),
    git_init: () => !config.initGit || hasGitCommit(targetRoot),
  };
}

const SETUP_STEPS = [
  { id: "init_expo", label: "Create Expo project" },
  { id: "copy_src", label: "Copy src folder" },
  { id: "copy_root_files", label: "Copy root boilerplate files" },
  { id: "copy_agent_tooling", label: "Copy .agents, .cursor, and plugins folders" },
  { id: "copy_config", label: "Copy config files" },
  { id: "write_app_json", label: "Write app.json" },
  { id: "merge_package_json", label: "Merge package.json scripts" },
  { id: "yarn_install", label: "Install dependencies (yarn)" },
  {
    id: "expo_install_deps",
    label: "Install boilerplate packages (expo install)",
  },
  { id: "expo_install_fix", label: "Align Expo package versions" },
  {
    id: "validate_install",
    label: "Validate install (expo-doctor + tsc)",
  },
  { id: "prebuild", label: "Generate android/ and ios/ (prebuild)" },
  { id: "patch_ios_podfile", label: "Patch iOS Podfile for Firebase" },
  { id: "pod_install", label: "Install CocoaPods (ios/)" },
  { id: "git_init", label: "Initialize git repository" },
];

function getCompletedSteps(targetRoot, config) {
  const checks = getStepChecks(targetRoot, config);
  const fromFilesystem = SETUP_STEPS.filter((setupStep) =>
    checks[setupStep.id](),
  ).map((setupStep) => setupStep.id);

  const savedState = loadSetupState(targetRoot);
  const fromState = savedState?.completedSteps ?? [];

  return new Set([...fromFilesystem, ...fromState]);
}

function getNextStepId(completedSteps) {
  const next = SETUP_STEPS.find(
    (setupStep) => !completedSteps.has(setupStep.id),
  );
  return next?.id ?? null;
}

function getResumeSummary(targetRoot, config) {
  const completedSteps = getCompletedSteps(targetRoot, config);
  const nextStepId = getNextStepId(completedSteps);
  const nextStep = SETUP_STEPS.find((setupStep) => setupStep.id === nextStepId);

  if (!nextStep) {
    return "complete";
  }

  return nextStep.label;
}

function listCandidateProjects() {
  ensureProjectsDir();

  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(PROJECTS_DIR, entry.name))
    .filter((targetRoot) => {
      if (path.resolve(targetRoot) === BOILERPLATE_ROOT) {
        return false;
      }

      return (
        loadSetupState(targetRoot) ||
        isExpoProject(targetRoot) ||
        fs.existsSync(path.join(targetRoot, "app.json"))
      );
    })
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

async function selectExistingProject() {
  const projects = listCandidateProjects();

  if (projects.length === 0) {
    throw new Error(
      `No resumable projects found in ${PROJECTS_DIR}. Create a new project instead.`,
    );
  }

  const choices = projects.map((targetRoot) => {
    const folderName = path.basename(targetRoot);
    let config;

    try {
      config = loadConfigFromProject(targetRoot);
    } catch {
      config = { folderName, initGit: true };
    }

    const status = getResumeSummary(targetRoot, config);

    return {
      value: targetRoot,
      label:
        status === "complete"
          ? `${folderName} — setup already complete`
          : `${folderName} — resume from: ${status}`,
    };
  });

  const selected = await askChoice(
    `Select an existing project in ${PROJECTS_DIR}:`,
    choices,
  );

  return selected;
}

function loadConfigFromProject(targetRoot) {
  const savedState = loadSetupState(targetRoot);
  if (savedState?.config) {
    return {
      ...savedState.config,
      folderName: savedState.config.folderName || path.basename(targetRoot),
      targetRoot,
    };
  }

  const appJson = readJsonFile(path.join(targetRoot, "app.json"));
  const expo = appJson?.expo;

  if (!expo) {
    throw new Error(
      `Could not load project config from ${targetRoot}. Missing app.json or setup state.`,
    );
  }

  return {
    folderName: path.basename(targetRoot),
    targetRoot,
    appName: expo.name || path.basename(targetRoot),
    slug: expo.slug || toSlug(path.basename(targetRoot)),
    scheme: expo.scheme || toScheme(path.basename(targetRoot)),
    iosBundleId:
      expo.ios?.bundleIdentifier || defaultBundleId(path.basename(targetRoot)),
    androidPackage:
      expo.android?.package ||
      expo.ios?.bundleIdentifier ||
      defaultBundleId(path.basename(targetRoot)),
    version: expo.version || "1.0.0",
    iosBuildNumber: expo.ios?.buildNumber || "1",
    expoSdkVersion: DEFAULT_EXPO_SDK,
    expoOwner: expo.owner || "",
    initGit: true,
  };
}

function copyIfExists(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  fs.cpSync(sourcePath, targetPath, { recursive: true });
  return true;
}

function copyBoilerplateFile(relativePath, targetRoot) {
  const sourcePath = path.join(BOILERPLATE_ROOT, relativePath);
  const targetPath = path.join(targetRoot, relativePath);

  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
  return true;
}

function ensureAppIconAssets(targetRoot) {
  const sourceIconsDir = path.join(BOILERPLATE_ROOT, "src", "assets", "icons");
  const targetIconsDir = path.join(targetRoot, "src", "assets", "icons");

  if (!fs.existsSync(sourceIconsDir)) {
    return;
  }

  fs.mkdirSync(targetIconsDir, { recursive: true });

  for (const fileName of APP_ICON_FILES) {
    const sourcePath = path.join(sourceIconsDir, fileName);
    const targetPath = path.join(targetIconsDir, fileName);

    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      log(`  • src/assets/icons/${fileName}`);
    }
  }
}

/**
 * Package names from the boilerplate to install via `expo install`.
 * Excludes expo/react/react-native from deps (provided by the Expo template).
 * @returns {{ deps: string[], devDeps: string[] }}
 */
function getBoilerplatePackageNames() {
  const packageJson = readJsonFile(path.join(BOILERPLATE_ROOT, "package.json"));
  if (!packageJson) {
    throw new Error("Boilerplate package.json not found.");
  }

  const excludeDeps = new Set(["expo", "react", "react-native"]);
  const deps = Object.keys(packageJson.dependencies || {}).filter(
    (name) => !excludeDeps.has(name),
  );
  const devDeps = Object.keys(packageJson.devDependencies || {});

  return { deps, devDeps };
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Install packages with `npx expo install`, chunked to avoid shell length limits.
 * Hard-fails on error (does not catch).
 * @param {string[]} packages
 * @param {{ cwd: string, dev?: boolean }} options
 */
function runExpoInstall(packages, { cwd, dev = false }) {
  if (!packages.length) {
    return;
  }

  const chunks = chunkArray(packages, EXPO_INSTALL_CHUNK_SIZE);
  for (const chunk of chunks) {
    const flag = dev ? "--dev " : "";
    run(`npx expo install ${flag}${chunk.join(" ")}`, { cwd });
  }
}

/**
 * Merges scripts (and expo.doctor config) from the boilerplate into the target.
 * Does not copy dependency versions — those are installed via expo install.
 */
function mergePackageJson(targetRoot) {
  const boilerplatePkgPath = path.join(BOILERPLATE_ROOT, "package.json");
  const targetPkgPath = path.join(targetRoot, "package.json");

  if (!fs.existsSync(boilerplatePkgPath)) {
    throw new Error(
      "Boilerplate package.json not found. Cannot merge package.json.",
    );
  }

  const boilerplatePkg = JSON.parse(
    fs.readFileSync(boilerplatePkgPath, "utf8"),
  );
  const targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, "utf8"));

  targetPkg.name = path.basename(targetRoot);
  targetPkg.scripts = {
    ...targetPkg.scripts,
    ...boilerplatePkg.scripts,
  };

  if (boilerplatePkg.expo) {
    targetPkg.expo = {
      ...targetPkg.expo,
      ...boilerplatePkg.expo,
      doctor: {
        ...(targetPkg.expo?.doctor || {}),
        ...(boilerplatePkg.expo.doctor || {}),
        reactNativeDirectoryCheck: {
          ...(targetPkg.expo?.doctor?.reactNativeDirectoryCheck || {}),
          ...(boilerplatePkg.expo.doctor?.reactNativeDirectoryCheck || {}),
        },
      },
    };
  }

  fs.writeFileSync(targetPkgPath, `${JSON.stringify(targetPkg, null, 2)}\n`);
}

/**
 * Patch ios/Podfile so RNFirebase works with Expo's static frameworks.
 * Newer RNFirebase defaults to SPM, which cannot combine with static linkage.
 * Also restores Firebase modular_headers (previous create-project behavior).
 */
function patchIosPodfileForFirebase(targetRoot) {
  const podfilePath = path.join(targetRoot, "ios", "Podfile");
  if (!fs.existsSync(podfilePath)) {
    warn("ios/Podfile not found. Skipping Firebase Podfile patch.");
    return false;
  }

  const pluginPath = path.join(
    BOILERPLATE_ROOT,
    "plugins",
    "withRnFirebaseIos.js",
  );
  let ensureFixes;
  if (fs.existsSync(pluginPath)) {
    ensureFixes = require(pluginPath).ensureRnFirebasePodfileFixes;
  }

  const original = fs.readFileSync(podfilePath, "utf8");
  let updated = original;

  if (typeof ensureFixes === "function") {
    updated = ensureFixes(original);
  } else {
    // Fallback if the plugin file was not copied yet
    if (!updated.includes("$RNFirebaseDisableSPM")) {
      updated = `$RNFirebaseDisableSPM = true\n$RNFirebaseAsStaticFramework = true\n\n${updated}`;
    }
    if (!updated.includes("FirebaseCoreInternal") && updated.includes("use_react_native!")) {
      const modular = [
        "  # Firebase modular headers",
        "  pod 'FirebaseCoreInternal', :modular_headers => true",
        "  pod 'GoogleUtilities', :modular_headers => true",
        "  pod 'FirebaseCore', :modular_headers => true",
        "  pod 'Firebase', :modular_headers => true",
        "  pod 'FirebaseInstallations', :modular_headers => true",
        "  pod 'GoogleDataTransport', :modular_headers => true",
        "  pod 'nanopb', :modular_headers => true",
        "  pod 'FirebaseCoreExtension', :modular_headers => true",
        "  pod 'RecaptchaInterop', :modular_headers => true",
        "",
      ].join("\n");
      updated = updated.replace(
        /^([ \t]*)use_react_native!/m,
        `${modular}$1use_react_native!`,
      );
    }
  }

  if (updated !== original) {
    fs.writeFileSync(podfilePath, updated);
  }

  return updated.includes("$RNFirebaseDisableSPM");
}

function buildAppJson(config) {
  const boilerplateAppJsonPath = path.join(BOILERPLATE_ROOT, "app.json");
  const boilerplateAppJson = JSON.parse(
    fs.readFileSync(boilerplateAppJsonPath, "utf8"),
  );

  const expo = {
    ...boilerplateAppJson.expo,
    name: config.appName,
    slug: config.slug,
    scheme: config.scheme,
    version: config.version,
    ios: {
      ...boilerplateAppJson.expo.ios,
      bundleIdentifier: config.iosBundleId,
      buildNumber: config.iosBuildNumber,
    },
    android: {
      ...boilerplateAppJson.expo.android,
      package: config.androidPackage,
    },
  };

  if (config.expoOwner) {
    expo.owner = config.expoOwner;
  } else {
    delete expo.owner;
  }

  if (expo.extra?.eas) {
    delete expo.extra.eas.projectId;
    if (Object.keys(expo.extra.eas).length === 0) {
      delete expo.extra.eas;
    }
  }

  if (expo.extra && Object.keys(expo.extra).length === 0) {
    delete expo.extra;
  }

  return { expo };
}

async function collectNewProjectConfig() {
  const folderName = await ask("New project folder name");
  validateFolderName(folderName);

  const targetRoot = path.join(PROJECTS_DIR, folderName);
  if (fs.existsSync(targetRoot)) {
    throw new Error(`Target folder already exists: ${targetRoot}`);
  }

  const defaultSlug = toSlug(folderName);
  const defaultScheme = toScheme(folderName);
  const suggestedBundleId = defaultBundleId(folderName);

  const appName = await ask("App display name", folderName);
  const slug = await ask("Expo slug (URL-safe)", defaultSlug);
  validateSlug(slug);

  const scheme = await ask("URL scheme for deep linking", defaultScheme);
  validateScheme(scheme);

  const iosBundleId = await ask("iOS bundle identifier", suggestedBundleId);
  validateBundleId(iosBundleId);

  const androidPackage = await ask("Android application ID", iosBundleId);
  validateBundleId(androidPackage);

  const version = await ask("App version", "1.0.0");
  const iosBuildNumber = await ask("iOS build number", "1");
  const expoSdkInput = await ask(
    'Expo SDK version (e.g. 54, or type "latest")',
    DEFAULT_EXPO_SDK,
  );
  const expoSdkVersion = resolveExpoSdkMajor(expoSdkInput);

  if (expoSdkVersion !== "54") {
    warn(
      `SDK ${expoSdkVersion} is a non-default/upgrade scaffold (default is SDK 54).`,
    );
    const continueAnyway = await askYesNo(
      `Continue scaffolding with Expo SDK ${expoSdkVersion}?`,
      false,
    );
    if (!continueAnyway) {
      throw new Error("Setup cancelled.");
    }
  }

  const boilerplateMajor = getBoilerplateExpoMajor();
  if (expoSdkVersion !== boilerplateMajor) {
    warn(
      `Selected SDK ${expoSdkVersion} differs from the boilerplate major (SDK ${boilerplateMajor}). Dependencies will still be installed for the selected SDK.`,
    );
  }

  const expoOwner = await ask("Expo owner (optional, press Enter to skip)", "");
  const initGit = await askYesNo(
    "Initialize git and create the first commit?",
    true,
  );

  return {
    folderName,
    targetRoot,
    appName,
    slug,
    scheme,
    iosBundleId,
    androidPackage,
    version,
    iosBuildNumber,
    expoSdkVersion,
    expoOwner,
    initGit,
  };
}

function markStepComplete(targetRoot, config, completedSteps, stepId) {
  completedSteps.add(stepId);
  saveSetupState(targetRoot, config, completedSteps);
}

async function runSetupStep(stepId, config, completedSteps) {
  const targetRoot = config.targetRoot;

  switch (stepId) {
    case "init_expo": {
      const { sdkMajor, template } = getExpoTemplate(
        config.expoSdkVersion || DEFAULT_EXPO_SDK,
      );
      ensureProjectsDir();
      step(`Creating Expo project with SDK ${sdkMajor} (template ${template})`);
      run(
        `npx create-expo-app@latest ${quoteShellPath(targetRoot)} --template ${template} --yes --no-install --no-agents-md`,
        { cwd: PROJECTS_DIR },
      );
      success(`Expo project created at ${targetRoot} (SDK ${sdkMajor})`);
      break;
    }

    case "copy_src": {
      step("Copying src folder from boilerplate");
      copyIfExists(
        path.join(BOILERPLATE_ROOT, "src"),
        path.join(targetRoot, "src"),
      );
      ensureAppIconAssets(targetRoot);
      success("Copied src/");
      break;
    }

    case "copy_root_files": {
      step("Copying root boilerplate files");
      for (const file of ROOT_FILES_TO_COPY) {
        if (copyBoilerplateFile(file, targetRoot)) {
          log(`  • ${file}`);
        }
      }
      success("Root files copied");
      break;
    }

    case "copy_agent_tooling": {
      step("Copying .agents, .cursor, and plugins folders");
      let copiedFolderCount = 0;
      for (const folder of ROOT_FOLDERS_TO_COPY) {
        if (copyBoilerplateFile(folder, targetRoot)) {
          log(`  • ${folder}/`);
          copiedFolderCount += 1;
        }
      }

      if (copiedFolderCount === 0) {
        warn("No .agents, .cursor, or plugins folders were found to copy.");
      } else {
        success(`Copied ${copiedFolderCount} tooling folder(s).`);
      }
      break;
    }

    case "copy_config": {
      step("Copying config files from boilerplate");
      let copiedConfigCount = 0;
      for (const file of CONFIG_FILES) {
        if (copyBoilerplateFile(file, targetRoot)) {
          log(`  • ${file}`);
          copiedConfigCount += 1;
        }
      }

      if (copiedConfigCount === 0) {
        warn("No config files were found to copy.");
      } else {
        success(`Copied ${copiedConfigCount} config file(s).`);
      }
      break;
    }

    case "write_app_json": {
      step("Writing app.json with project-specific values");
      const appJson = buildAppJson(config);
      fs.writeFileSync(
        path.join(targetRoot, "app.json"),
        `${JSON.stringify(appJson, null, 2)}\n`,
      );
      success("app.json updated");
      break;
    }

    case "merge_package_json": {
      step("Merging package.json scripts from boilerplate");
      mergePackageJson(targetRoot);
      success("package.json scripts merged");
      break;
    }

    case "yarn_install": {
      step("Installing dependencies with yarn");
      run("yarn install", { cwd: targetRoot });
      success("Dependencies installed");
      break;
    }

    case "expo_install_deps": {
      step("Installing boilerplate packages with expo install");
      const { deps, devDeps } = getBoilerplatePackageNames();
      runExpoInstall(deps, { cwd: targetRoot });
      if (devDeps.length > 0) {
        runExpoInstall(devDeps, { cwd: targetRoot, dev: true });
      }
      success("Boilerplate packages installed");
      break;
    }

    case "expo_install_fix": {
      step("Aligning Expo-compatible package versions");
      run("npx expo install --fix", { cwd: targetRoot });
      success("Expo dependencies aligned");
      break;
    }

    case "validate_install": {
      step("Validating install (expo-doctor + tsc)");
      run("npx expo-doctor", { cwd: targetRoot });
      run("npx tsc --noEmit", { cwd: targetRoot });
      fs.writeFileSync(path.join(targetRoot, VALIDATED_MARKER_FILE), "");
      success("Install validated");
      break;
    }

    case "prebuild": {
      ensureAppIconAssets(targetRoot);
      step("Running Expo prebuild for Android and iOS");
      const hasAndroid = fs.existsSync(path.join(targetRoot, "android"));
      const hasIos = fs.existsSync(path.join(targetRoot, "ios"));
      // --no-install: skip CocoaPods until after Firebase Podfile patch
      const prebuildCommand =
        hasAndroid || hasIos
          ? "npx expo prebuild --no-install"
          : "npx expo prebuild --clean --no-install";

      run(prebuildCommand, { cwd: targetRoot });
      success("Native android/ and ios/ folders generated");
      break;
    }

    case "patch_ios_podfile": {
      step("Patching ios/Podfile for React Native Firebase");
      const iosDir = path.join(targetRoot, "ios");
      if (!fs.existsSync(iosDir)) {
        warn("ios/ folder was not generated. Skipping Podfile patch.");
        break;
      }

      const patched = patchIosPodfileForFirebase(targetRoot);
      if (patched) {
        success(
          "Podfile patched ($RNFirebaseDisableSPM + Firebase modular_headers)",
        );
      } else {
        throw new Error(
          "Failed to patch ios/Podfile for Firebase. Refusing to run pod install.",
        );
      }
      break;
    }

    case "pod_install": {
      step("Installing CocoaPods in ios/");
      const iosDir = path.join(targetRoot, "ios");
      if (process.platform === "darwin" && fs.existsSync(iosDir)) {
        run("pod install", { cwd: iosDir });
        success("CocoaPods installed");
      } else if (!fs.existsSync(iosDir)) {
        warn("ios/ folder was not generated. Skipping pod install.");
      } else {
        warn("Skipping pod install because this is not macOS.");
      }
      break;
    }

    case "git_init": {
      if (!config.initGit) {
        if (
          fs.existsSync(path.join(targetRoot, ".git")) &&
          !hasGitCommit(targetRoot)
        ) {
          fs.rmSync(path.join(targetRoot, ".git"), {
            recursive: true,
            force: true,
          });
          warn("Removed .git directory because git init was disabled.");
        }
        skip("Git init skipped by configuration");
        break;
      }

      step("Initializing git repository");
      const gitDir = path.join(targetRoot, ".git");
      if (!fs.existsSync(gitDir)) {
        run("git init", { cwd: targetRoot });
      }

      if (!hasGitCommit(targetRoot)) {
        run("git add .", { cwd: targetRoot });
        run('git commit -m "Initial commit from react-native boilerplate"', {
          cwd: targetRoot,
        });
        success("Git repository initialized with first commit");
      } else {
        skip("Git repository already has a commit");
      }
      break;
    }

    default:
      throw new Error(`Unknown setup step: ${stepId}`);
  }

  markStepComplete(targetRoot, config, completedSteps, stepId);
}

async function runSetup(config, options = {}) {
  const { resume = false } = options;
  const completedSteps = getCompletedSteps(config.targetRoot, config);
  const pendingSteps = SETUP_STEPS.filter(
    (setupStep) => !completedSteps.has(setupStep.id),
  );

  if (pendingSteps.length === 0) {
    success("All setup steps are already complete.");
    printNextSteps(config.targetRoot);
    return;
  }

  if (resume) {
    console.log("\nResume plan:");
    const done = SETUP_STEPS.filter((setupStep) =>
      completedSteps.has(setupStep.id),
    );
    done.forEach((setupStep) => log(`  ✓ ${setupStep.label}`));
    pendingSteps.forEach((setupStep) => log(`  → ${setupStep.label}`));
    console.log("");
  }

  for (const setupStep of pendingSteps) {
    await runSetupStep(setupStep.id, config, completedSteps);
  }

  console.log("\n🎉 Project setup complete!\n");
  printNextSteps(config.targetRoot);
}

function printNextSteps(targetRoot) {
  const copyEnvCommand = IS_WINDOWS
    ? "copy .env.example .env"
    : "cp .env.example .env";

  console.log(`Project path: ${targetRoot}`);
  console.log("\nNext steps:");
  console.log(`  cd ${quoteShellPath(targetRoot)}`);
  console.log(`  ${copyEnvCommand}`);
  console.log("  # copy .env.example to .env and fill keys when ready");
  console.log(
    "  # Firebase push (later): add google-services.json + GoogleService-Info.plist,",
  );
  console.log(
    "  # set android/ios googleServicesFile in app.json, add plugin @react-native-firebase/app,",
  );
  console.log("  # then: npx expo prebuild --clean && cd ios && pod install");
  console.log("  # link an EAS project later when you are ready (eas init / eas build)");
  if (!IS_WINDOWS) {
    console.log("  yarn ios               # build & install dev client (iOS)");
  }
  console.log(
    "  yarn android           # build & install dev client (Android)",
  );
  console.log("  yarn start             # start Metro for the dev client");
  if (IS_WINDOWS) {
    console.log(
      "\nNote: iOS builds require macOS. On Windows, use Android or a cloud Mac builder.",
    );
  }
}

function printConfigSummary(config, modeLabel) {
  console.log(`\n${modeLabel}`);
  console.log(`  Folder:          ${config.folderName}`);
  console.log(`  Path:            ${config.targetRoot}`);
  console.log(`  Display name:    ${config.appName}`);
  console.log(`  Slug:            ${config.slug}`);
  console.log(`  Scheme:          ${config.scheme}`);
  console.log(`  iOS bundle ID:   ${config.iosBundleId}`);
  console.log(`  Android package: ${config.androidPackage}`);
  console.log(`  Version:         ${config.version}`);
  console.log(`  iOS build:       ${config.iosBuildNumber}`);
  console.log(
    `  Expo SDK:        ${config.expoSdkVersion || DEFAULT_EXPO_SDK}`,
  );
  console.log(`  Git init:        ${config.initGit ? "yes" : "no"}`);
}

async function confirmProceed() {
  return new Promise((resolve) => {
    const confirmRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    confirmRl.question("\nProceed with setup? [Y/n]: ", (answer) => {
      confirmRl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(!normalized || normalized === "y" || normalized === "yes");
    });
  });
}

async function main() {
  console.log("Expo React Native Boilerplate — Project Setup\n");
  console.log(`Boilerplate: ${BOILERPLATE_ROOT}`);
  console.log(`New projects will be created in: ${PROJECTS_DIR}`);
  console.log(`Platform: ${process.platform}\n`);

  try {
    ensureProjectsDir();

    const resumeExisting = await askYesNo(
      "Resume setup on an existing project?",
      false,
    );

    let config;

    if (resumeExisting) {
      const targetRoot = await selectExistingProject();
      config = loadConfigFromProject(targetRoot);
      printConfigSummary(config, "Resuming project:");

      const nextStep = getResumeSummary(targetRoot, config);
      if (nextStep === "complete") {
        success("This project setup is already complete.");
        printNextSteps(targetRoot);
        rl.close();
        return;
      }

      console.log(`  Next step:       ${nextStep}`);
    } else {
      config = await collectNewProjectConfig();
      printConfigSummary(config, "New project:");
    }

    rl.close();

    const confirmed = await confirmProceed();
    if (!confirmed) {
      console.log("Setup cancelled.");
      process.exit(0);
    }

    await runSetup(config, { resume: resumeExisting });
  } catch (error) {
    rl.close();
    fail(error.message || String(error));
    process.exit(1);
  }
}

main();
