import BN from 'bn.js'
import React from 'react'

import { SelectStakingAccount } from '@/accounts/components/SelectAccount'
import { InputComponent } from '@/common/components/forms'
import { LinkSymbol } from '@/common/components/icons/symbols'
import { Row } from '@/common/components/Modal'
import { RowGapBlock } from '@/common/components/page/PageContent'
import { TooltipExternalLink } from '@/common/components/Tooltip'
import { TextMedium, ValueInJoys } from '@/common/components/typography'
import { formatTokenValue } from '@/common/model/formatters'

interface StakingAccountStepProps {
  requiredStake: BN
}

export const StakingAccountStep = ({ requiredStake }: StakingAccountStepProps) => {
  return (
    <RowGapBlock gap={24}>
      <Row>
        <RowGapBlock gap={8}>
          <h4>General parameters</h4>
          <TextMedium lighter>Staking account</TextMedium>
        </RowGapBlock>
      </Row>
      <Row>
        <RowGapBlock gap={20}>
          <RowGapBlock gap={8}>
            <TextMedium>
              You must stake <ValueInJoys>{formatTokenValue(requiredStake)}</ValueInJoys> to create this proposal. This
              stake will be returned to you when the proposal is either rejected or accepted via council voting. Please
              note the duration of the voting period is displayed on the left and your funds will be locked for at least
              the duration of the voting period
            </TextMedium>
          </RowGapBlock>
          <InputComponent
            label="Select account for Staking"
            tooltipText={
              <>
                The budget is the root resource pool for all token minting in the working group, and the size of the
                pool is denoted by budget.
                <TooltipExternalLink
                  href="https://joystream.gitbook.io/joystream-handbook/key-concepts/staking#locks-1"
                  target="_blank"
                >
                  <TextMedium>Link</TextMedium> <LinkSymbol />
                </TooltipExternalLink>
              </>
            }
            inputSize="l"
            required
            name="stakingAccount.stakingAccount"
          >
            <SelectStakingAccount
              name="stakingAccount.stakingAccount"
              minBalance={requiredStake}
              lockType="Proposals"
            />
          </InputComponent>
        </RowGapBlock>
      </Row>
    </RowGapBlock>
  )
}
