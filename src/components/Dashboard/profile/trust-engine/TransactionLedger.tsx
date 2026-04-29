"use client"

import { ArrowUpRight, ExternalLink } from "lucide-react"
import { Badge } from "../../../ui/badge"
import { Card } from "../../../ui/card"
import PaginationComponent from "@/src/components/common/Pagination"
import { formatActivityName } from "@/src/utils/clientHelper"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"

interface TransactionProps {
  transection_id: number
  reward_id: number
  amount: number
  transection_type: string
  created_at: string
  trust_verification_id?: number | null
  metadata?: { proof_url?: string | null } | null
  rule?: {
    action_display_name: string
    category_group: string
    description: string
  }
}

interface TransactionLedgerProps {
  TransactionsData: TransactionProps[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TransactionLedger({
  TransactionsData,
  currentPage,
  totalPages,
  onPageChange
}: TransactionLedgerProps) {
  const data = Array.isArray(TransactionsData) ? TransactionsData : []

  return (
    <Card className="flex flex-col p-2 sm:p-6">
      <h3 className="font-semibold text-foreground mb-4 shrink-0">
        Transaction History
      </h3>

      {/* Only rows scroll — keeping pagination outside prevents the browser
          from invoking scrollIntoView on pagination clicks, which was causing
          the card to jump to the top of the viewport on mobile. */}
      <div className="overflow-y-auto max-h-[50vh] sm:max-h-none sm:overflow-y-visible space-y-2 sm:space-y-3 pr-1">
        {data.map((transaction) => (
          <TransactionRow
            key={transaction.transection_id}
            transaction={transaction}
          />
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="overflow-x-auto border-t pt-4 mt-3 shrink-0">
          <PaginationComponent
            pagination={{
              page: currentPage,
              totalPages,
              total: 0,
              limit: 10
            }}
            onPageChange={onPageChange}
            compactOnMobile={true}
          />
        </div>
      )}
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: TransactionProps }) {
  const proofUrl = transaction.metadata?.proof_url ?? null
  const isVerifiedTask = transaction.trust_verification_id != null && !!proofUrl
  return (
    <div className="flex gap-2 rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-start sm:gap-4 sm:p-4">
      <div className="p-2 rounded-lg flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border shrink-0">
        <ArrowUpRight className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h4 className="break-words text-sm font-medium text-foreground">
            {transaction.rule?.action_display_name ?? "Reward"}
          </h4>
          <Badge variant="outline" className="text-xs max-w-full">
            {formatActivityName(transaction.rule?.category_group ?? "General")}
          </Badge>
        </div>
        <p className="mb-2 break-words text-xs text-muted-foreground">
          {transaction.rule?.description}
        </p>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.created_at).toLocaleDateString()}
          </p>
          {isVerifiedTask && (
            <LinkAsButton
              href={proofUrl!}
              target="_blank"
              rel="noopener noreferrer"
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs sm:px-2"
            >
              View task
              <ExternalLink className="h-3 w-3" />
            </LinkAsButton>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-1 sm:items-end">
        {transaction.reward_id === 1 && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary sm:text-base">
            <ArrowUpRight className="h-4 w-4" />+{transaction.amount} RP
          </div>
        )}
        {transaction.reward_id === 2 && (
          <div className="flex items-center gap-1 text-sm font-medium text-purple-600 sm:text-base">
            <ArrowUpRight className="h-4 w-4" />+{transaction.amount} SC
          </div>
        )}
      </div>
    </div>
  )
}
