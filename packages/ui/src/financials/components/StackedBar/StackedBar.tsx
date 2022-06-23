import BN from 'bn.js'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { HorizontalStackedBar } from '@/common/components/HorizontalStackedBar'
import { List } from '@/common/components/List'
import { TextBig, TextMedium, TokenValue } from '@/common/components/typography'
import { BN_ZERO } from '@/common/constants'
import { DataListItem } from '@/financials/components/StackedBar/components/DataListItem'
import { chartColors } from '@/financials/types/constants'

export type Data = Record<string, BN>

export interface StackedBarProps {
  data: Data
  title: string
  active?: string | number
  setActive?: (key: string | number) => void
  barHeight?: number
  haveHover?: boolean
}

export const StackedBar = ({ data, title, active, setActive, haveHover = true, barHeight = 50 }: StackedBarProps) => {
  const [preview, setPreview] = useState<number | string | null>(null)
  // const totalValue = useMemo(() => Object.entries(data).reduce((prev, next) => prev + next[1], 0), [data])
  const totalValue = useMemo(
    () => Object.entries(data).reduce((prev, next) => prev.add(new BN(next[1])), BN_ZERO),
    [data]
  )

  return (
    <>
      <TitleContainer>
        <TextBig value bold>
          {title}
        </TextBig>
        <TokenValue value={totalValue || 0} size="l" />
      </TitleContainer>
      <HorizontalStackedBar
        keys={Object.keys(data)}
        data={data as any} //has to be changed
        height={barHeight}
        tooltip={(node) => (
          <Tooltip>
            <TextMedium value>{node.id}</TextMedium>
          </Tooltip>
        )}
        onMouseLeave={() => setPreview(null)}
        onMouseEnter={(node) => setPreview(node.id)}
        onBarClick={(node) => setActive?.(node.id)}
      />
      <StyledList as="div">
        {Object.entries(data).map((item, index) => {
          const [key, value] = item
          return (
            <DataListItem
              key={item[0]}
              onClick={() => setActive?.(key)}
              isPreview={haveHover && preview === key}
              isActive={active === key}
              title={key}
              color={chartColors[index]}
              percentage={value
                .div(totalValue || BN_ZERO)
                .muln(100)
                .toNumber()}
              value={<TokenValue value={value} />}
              haveHover={haveHover}
            />
          )
        })}
      </StyledList>
    </>
  )
}

export const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledList = styled(List)`
  row-gap: 1px;
`

const Tooltip = styled.div`
  padding: 5px 10px;
  background-color: rgba(31, 37, 46, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  color: #fff;
`
