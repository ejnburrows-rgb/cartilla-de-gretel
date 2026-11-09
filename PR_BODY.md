### 🎯 What
Added the missing error path test for the `handleCreateClass` function in `ClassRoster.tsx`. The test explicitly checks that when the `createClass` API call fails, the UI correctly displays the error message triggered in the `catch` block (lines 158-160).

### 📊 Coverage
The new test scenario ensures the catch block logic inside `handleCreateClass` operates as intended, by mocking the API call (`createClass`) to throw an error and subsequently asserting the resulting error state output on screen using `@testing-library/react`.

### ✨ Result
Code coverage and resilience improved. The test successfully passes the previously uncovered error flow logic.

**Test Summary:**
```
✓ src/components/teacher/__tests__/ClassRoster.test.tsx (7 tests)
```
1 Test Suite Passed
7 Tests Passed
