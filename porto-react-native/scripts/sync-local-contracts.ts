#!/usr/bin/env tsx

/**
 * Sync Local Relay Contract Addresses
 * 
 * This script extracts contract addresses from the running local relay
 * and updates src/lib/_generated/contracts.ts with the correct addresses
 * for chain ID 31337 (local Anvil).
 * 
 * Run with: pnpm relay:sync
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const CHAIN_ID = 31337

interface RelayConfig {
  chains: {
    anvil: {
      assets: {
        exp: { address: string }
        exp2: { address: string }
      }
    }
  }
}

async function main() {
  console.log('🔄 Syncing local relay contract addresses...\n')

  // Check if Docker containers are running
  try {
    const ps = execSync('docker compose ps', { encoding: 'utf-8' })
    if (!ps.includes('porto-anvil-1') || !ps.includes('Up')) {
      console.error('❌ Local relay is not running\n')
      console.log('💡 Start it first with:')
      console.log('   pnpm relay:start\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Could not check Docker status')
    console.error('   Make sure Docker is running\n')
    process.exit(1)
  }

  // Extract relay.yaml from Docker volume
  console.log('📥 Extracting addresses from local relay...')
  let relayYaml: string
  try {
    relayYaml = execSync(
      'docker run --rm -v porto_state:/app alpine cat /app/relay.yaml',
      { encoding: 'utf-8' }
    )
  } catch (error) {
    console.error('❌ Could not extract relay configuration\n')
    process.exit(1)
  }

  // Extract addresses from the YAML text directly using regex (avoids YAML parsing hex issues)
  const exp1Match = relayYaml.match(/exp:\s+address:\s+(0x[0-9a-fA-F]+)/m)
  const exp2Match = relayYaml.match(/exp2:\s+address:\s+(0x[0-9a-fA-F]+)/m)
  const delegationMatch = relayYaml.match(/delegation_proxy:\s+(0x[0-9a-fA-F]+)/m)
  
  const exp1Address = exp1Match?.[1]
  const exp2Address = exp2Match?.[1]
  const delegationAddress = delegationMatch?.[1]

  if (!exp1Address || !exp2Address || !delegationAddress) {
    console.error('❌ Could not find contract addresses in relay config\n')
    process.exit(1)
  }

  console.log('✅ Found addresses:')
  console.log(`   EXP1: ${exp1Address}`)
  console.log(`   EXP2: ${exp2Address}`)
  console.log(`   Delegation: ${delegationAddress}\n`)

  // Update contracts.ts file
  const contractsPath = 'src/lib/_generated/contracts.ts'
  console.log(`📝 Updating ${contractsPath}...`)

  let contractsFile = readFileSync(contractsPath, 'utf-8')

  // Update exp1Address for chain 31337
  // Match: export const exp1Address = {\n  31337: '0x...',
  contractsFile = contractsFile.replace(
    /(export const exp1Address = \{[^\}]*31337: ')0x[0-9a-fA-F]+(')/,
    `$1${exp1Address}$2`
  )

  // Update exp2Address for chain 31337
  contractsFile = contractsFile.replace(
    /(export const exp2Address = \{[^\}]*31337: ')0x[0-9a-fA-F]+(')/,
    `$1${exp2Address}$2`
  )

  // Update or add delegationAddress for chain 31337
  if (contractsFile.includes('export const delegationAddress')) {
    // Update existing delegationAddress
    contractsFile = contractsFile.replace(
      /(export const delegationAddress = \{[^\}]*31337: ')0x[0-9a-fA-F]+(')/,
      `$1${delegationAddress}$2`
    )
  } else {
    // Add delegationAddress export if it doesn't exist
    const delegationExport = `
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// delegation (local relay)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Local relay delegation proxy address (chain ID 31337)
 */
export const delegationAddress = {
  ${CHAIN_ID}: '${delegationAddress}',
} as const
`
    contractsFile = contractsFile + delegationExport
  }

  // Write updated file
  writeFileSync(contractsPath, contractsFile, 'utf-8')

  console.log('✅ Successfully updated contract addresses!\n')
  console.log('📝 Changes:')
  console.log(`   exp1Address[${CHAIN_ID}] = ${exp1Address}`)
  console.log(`   exp2Address[${CHAIN_ID}] = ${exp2Address}`)
  console.log(`   delegationAddress[${CHAIN_ID}] = ${delegationAddress}\n`)
  console.log('💡 Restart your app to use the new addresses:')
  console.log('   pnpm start\n')
}

main().catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})

