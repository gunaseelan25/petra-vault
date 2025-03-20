# Petra Vault

Petra Vault is a multisig wallet solution for the Aptos blockchain, developed by Aptos Labs. It provides a secure way to manage digital assets with multi-signature authorization requirements.

## Features

- **Multisig Wallet Management**: Create and manage multisig vaults on Aptos
- **Proposal System**: Create, review, and execute transaction proposals
- **Vault Settings**: Customize vault configuration and user permissions
- **Web-Based Interface**: Modern, responsive UI built with Next.js

## Getting Started

### Prerequisites

- Node.js (v22.14.0 or higher)
- pnpm (v10.6.5 or higher)

You can install these runtimes using [mise](https://mise.jdx.dev/).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aptos-labs/petra-vault.git
   cd petra-vault
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/apps/web`: Main web application
- `/packages`: Shared configurations and utilities

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Check types
pnpm check-types
```
