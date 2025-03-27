import { Page } from '@playwright/test';

export class NavigationFixture {
  constructor(private page: Page) {}

  async navigateTo(
    location: 'settings' | 'home' | 'create proposal' | 'publish contract'
  ) {
    await this.page.getByTestId(`nav-item-${location}`).click();
  }

  async navigateToCreateVault() {
    await this.page.getByTestId('site-header-logo').click();

    await this.page.getByTestId('authenticated-create-vault-button').click();
  }

  async navigateToHomeTab(tab: 'transactions' | 'coins') {
    await this.navigateTo('home');

    await this.page.getByTestId(`home-tab-item-${tab}`).click();
  }

  async navigateToSettingsTab(tab: 'setup' | 'export') {
    await this.navigateTo('settings');

    await this.page.getByTestId(`settings-tab-item-${tab}`).click();
  }

  async navigateToPendingTransaction(proposalSequenceNumber: number) {
    await this.navigateToHomeTab('transactions');

    await this.page
      .getByTestId(`pending-transaction-${proposalSequenceNumber}`)
      .click();
  }
}
