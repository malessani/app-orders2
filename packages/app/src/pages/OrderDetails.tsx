import { OrderAddresses } from '#components/OrderAddresses'
import { OrderCustomer } from '#components/OrderCustomer'
import { OrderDetailsContextMenu } from '#components/OrderDetailsContextMenu'
import { OrderPayment } from '#components/OrderPayment'
import { OrderShipments } from '#components/OrderShipments'
import { OrderSteps } from '#components/OrderSteps'
import { OrderSummary } from '#components/OrderSummary'
import { ScrollToTop } from '#components/ScrollToTop'
import { Timeline } from '#components/Timeline'
import { appRoutes } from '#data/routes'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { isMockedId } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  formatDate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

export function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const orderId = params?.orderId ?? ''

  const { order, isLoading } = useOrderDetails(orderId)

  if (orderId === undefined || !canUser('read', 'orders')) {
    return (
      <PageLayout
        title='Orders'
        onGoBack={() => {
          setLocation(appRoutes.home.makePath())
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const pageTitle = `${order.market?.name} #${order.number}`

  return (
    <PageLayout
      mode={mode}
      actionButton={<OrderDetailsContextMenu order={order} />}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {order.placed_at != null ? (
            <div>
              {`Placed on ${formatDate({
                isoDate: order.placed_at ?? '',
                timezone: user?.timezone,
                format: 'full'
              })}`}
            </div>
          ) : order.updated_at != null ? (
            <div>
              {`Updated on ${formatDate({
                isoDate: order.updated_at ?? '',
                timezone: user?.timezone,
                format: 'full'
              })}`}
            </div>
          ) : null}
          {order.reference != null && <div>Ref. {order.reference}</div>}
        </SkeletonTemplate>
      }
      onGoBack={() => {
        goBack({
          setLocation,
          defaultRelativePath: appRoutes.home.makePath()
        })
      }}
      gap='only-top'
    >
      <ScrollToTop />
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          {!isMockedId(order.id) && (
            <Spacer top='6'>
              <ResourceTags
                resourceType='orders'
                resourceId={order.id}
                overlay={{ title: 'Edit tags', description: pageTitle }}
                onTagClick={(tagId) => {
                  setLocation(appRoutes.list.makePath(`tags_id_in=${tagId}`))
                }}
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <OrderSteps order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderSummary order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderCustomer order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderPayment order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderAddresses order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderShipments order={order} />
          </Spacer>
          {!['pending', 'draft'].includes(order.status) && (
            <Spacer top='14'>
              <Timeline order={order} />
            </Spacer>
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}
