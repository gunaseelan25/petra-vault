# Petra Vault Tests

## End-to-End Tests

The end-to-end tests are written using Playwright.

### Running the tests

```bash
pnpm test:e2e
```

### Writing the tests

#### Onboarding

At the beginning of all tests, you must call `onboarding.connectWallet` to connect a wallet to the application. Otherwise, you will receive errors asking you to "Set an account" or
"Set a network" to continue the test.

#### MockPetraWallet

`MockPetraWallet` is a mock implementation of the Aptos wallet standard used to simulate Petra Wallet in Playwright tests.

**It is IMPORTANT to note that the injection occurs every time `page.goto` is called. Therefore, make sure to only call `page.goto` ONCE and AT THE BEGINNING of a test for the duration of a single test.**

This mock wallet is injected into the page via `page.addInitScript` and communicated to via the `window` object.

If you would like to navigate somewhere, we recommend using the `navigation` fixture to do so.
