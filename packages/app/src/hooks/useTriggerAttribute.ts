import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  useCoreSdkProvider,
  type getOrderTriggerAttributeName
} from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'
import { orderIncludeAttribute } from './useOrderDetails'

type UITriggerAttributes = Parameters<typeof getOrderTriggerAttributeName>[0]

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (triggerAttribute: UITriggerAttributes) => Promise<void>
}

export function useTriggerAttribute(orderId: string): TriggerAttributeHook {
  const { mutateOrder } = useOrderDetails(orderId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        const updatedOrder = await sdkClient.orders.update(
          {
            id: orderId,
            [triggerAttribute]: true
          },
          {
            include: orderIncludeAttribute
          }
        )
        void mutateOrder(updatedOrder)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this order']
        )
      } finally {
        setIsLoading(false)
      }
    },
    [orderId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
