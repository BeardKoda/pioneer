import BN from 'bn.js'
import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'

import { useMyAccounts } from '@/accounts/hooks/useMyAccounts'
import { useStakingAccountsLocks } from '@/accounts/hooks/useStakingAccountsLocks'
import { accountOrNamed } from '@/accounts/model/accountOrNamed'
import { isValidAddress } from '@/accounts/model/isValidAddress'
import { RecoveryConditions } from '@/accounts/model/lockTypes'
import { Account, AccountOption, LockType } from '@/accounts/types'
import { Select, SelectedOption, SelectProps } from '@/common/components/selects'
import { useKeyring } from '@/common/hooks/useKeyring'
import { Address } from '@/common/types'

import { filterByText } from './helpers'
import { OptionAccount } from './OptionAccount'
import { OptionListAccount } from './OptionListAccount'

export const filterAccount = (filterOut: Account | AccountOption | Address | undefined) => {
  const filterOutAddress = typeof filterOut === 'string' ? filterOut : filterOut?.address
  return filterOut ? (account: AccountOption) => account.address !== filterOutAddress : () => true
}

interface SelectAccountProps extends Pick<SelectProps<AccountOption>, 'id' | 'selected' | 'disabled' | 'onBlur'> {
  onChange?: (selected: AccountOption) => void
  filter?: (option: AccountOption) => boolean
  name?: string
}

interface SelectStakingAccountProps extends SelectAccountProps {
  minBalance: BN
  lockType: LockType
  recoveryConditions?: RecoveryConditions
}

interface BaseSelectAccountProps extends SelectAccountProps {
  accounts: AccountOption[]
}

export const BaseSelectAccount = React.memo(
  ({ id, onChange, accounts, filter, selected, disabled, onBlur }: BaseSelectAccountProps) => {
    const options = accounts.filter(filter || (() => true))

    const [search, setSearch] = useState('')

    const filteredOptions = useMemo(() => filterByText(options, search), [search, options])
    const keyring = useKeyring()

    const notSelected = !selected || selected.address !== search

    useEffect(() => {
      if (filteredOptions.length === 0 && isValidAddress(search, keyring) && notSelected) {
        onChange?.(accountOrNamed(accounts, search, 'Unsaved account'))
      }
    }, [filteredOptions, search, notSelected])

    const change = (selected: AccountOption, close: () => void) => {
      onChange?.(selected)
      close()
    }

    return (
      <Select
        id={id}
        selected={selected}
        onChange={change}
        onBlur={onBlur}
        disabled={disabled}
        renderSelected={renderSelected}
        placeholder="Select account or paste account address"
        renderList={(onOptionClick) => <OptionListAccount onChange={onOptionClick} options={filteredOptions} />}
        onSearch={(search) => setSearch(search)}
      />
    )
  }
)

const renderSelected = (option: AccountOption) => (
  <SelectedOption>
    <OptionAccount option={option} />
  </SelectedOption>
)

export const SelectAccount = ({ name, ...props }: SelectAccountProps) => {
  const { allAccounts } = useMyAccounts()
  const accounts = allAccounts as AccountOption[]
  const form = useFormContext()

  if (!form || !name) {
    return <BaseSelectAccount {...props} accounts={accounts} />
  }

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <BaseSelectAccount
          {...props}
          selected={field.value}
          onChange={field.onChange}
          accounts={accounts}
          onBlur={field.onBlur}
        />
      )}
    />
  )
}

export const SelectStakingAccount = ({
  name,
  minBalance,
  lockType,
  recoveryConditions,
  ...props
}: SelectStakingAccountProps) => {
  const form = useFormContext()
  const accountsWithLocks = useStakingAccountsLocks({
    requiredStake: minBalance,
    lockType,
    recoveryConditions,
    filterByBalance: true,
  })

  if (!form || !name) {
    return <BaseSelectAccount {...props} accounts={accountsWithLocks} />
  }

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <BaseSelectAccount
          {...props}
          accounts={accountsWithLocks}
          selected={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  )
}
