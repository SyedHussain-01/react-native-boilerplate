const {
  withDangerousMod,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo prebuild uses static frameworks by default in many setups.
 * RNFirebase's default SPM mode cannot combine with static linkage.
 * This plugin forces CocoaPods mode and adds modular_headers for Firebase
 * transitive pods (same fix we previously applied in the create-project script).
 */
const FIREBASE_MODULAR_HEADER_PODS = [
  "FirebaseCoreInternal",
  "GoogleUtilities",
  "FirebaseCore",
  "Firebase",
  "FirebaseInstallations",
  "GoogleDataTransport",
  "nanopb",
  "FirebaseCoreExtension",
  "RecaptchaInterop",
];

const TAG_DISABLE_SPM = "# @generated begin rnfirebase-disable-spm";
const TAG_MODULAR = "# @generated begin rnfirebase-modular-headers";

function ensureRnFirebasePodfileFixes(podfileContents) {
  let contents = podfileContents;

  if (!contents.includes("$RNFirebaseDisableSPM")) {
    const preamble = [
      TAG_DISABLE_SPM,
      "$RNFirebaseDisableSPM = true",
      "$RNFirebaseAsStaticFramework = true",
      "# @generated end rnfirebase-disable-spm",
      "",
    ].join("\n");
    contents = `${preamble}${contents}`;
  }

  if (!contents.includes(TAG_MODULAR)) {
    const modularBlock = [
      `  ${TAG_MODULAR}`,
      ...FIREBASE_MODULAR_HEADER_PODS.map(
        (name) => `  pod '${name}', :modular_headers => true`,
      ),
      "  # @generated end rnfirebase-modular-headers",
      "",
    ].join("\n");

    // Insert inside the main app target, just before `use_react_native!` or
    // before the target's closing `end` that precedes post_install.
    if (contents.includes("use_react_native!")) {
      contents = contents.replace(
        /^([ \t]*)use_react_native!/m,
        `${modularBlock}$1use_react_native!`,
      );
    } else {
      // Fallback: inject before the first post_install
      contents = contents.replace(
        /^([ \t]*)post_install do/m,
        `${modularBlock}$1post_install do`,
      );
    }
  }

  return contents;
}

function withRnFirebaseIos(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Podfile",
      );
      if (!fs.existsSync(podfilePath)) {
        return cfg;
      }

      const original = fs.readFileSync(podfilePath, "utf8");
      const updated = ensureRnFirebasePodfileFixes(original);
      if (updated !== original) {
        fs.writeFileSync(podfilePath, updated);
      }
      return cfg;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withRnFirebaseIos,
  "with-rnfirebase-ios",
  "1.0.0",
);
module.exports.ensureRnFirebasePodfileFixes = ensureRnFirebasePodfileFixes;
module.exports.FIREBASE_MODULAR_HEADER_PODS = FIREBASE_MODULAR_HEADER_PODS;
