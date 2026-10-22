🔒 Replace Predictable Math.random with crypto.getRandomValues

🎯 **What:** The `SyllableTapGame` component was using `Math.random()` to shuffle an array of syllables.
⚠️ **Risk:** `Math.random()` generates predictable random numbers. While manipulating shuffle order in a learning app might not be a critical flaw, it triggers security audit alerts and doesn't follow best security practices for randomness.
🛡️ **Solution:** Replaced `Math.random()` with `crypto.getRandomValues()` to securely map values between `[0, 1)`, maintaining the expected shuffling behavior while ensuring unpredictability.
