"use client";

import { IconAction } from "@/components/ui/icon-action";
import { Glyph } from "@/components/ui/illustration-icon";
import { memoIconBg, resolveMemoIcon } from "@/lib/illustrations";
import { ExpandableCardBody } from "@/components/ui/expandable-card-body";
import { cn } from "@/lib/utils";
import {
  useCreateWishlistItem,
  useDeleteWishlistItem,
  useUpdateWishlistItem,
  useWishlist,
} from "@/features/wishlist/hooks";
import { WishlistItemDialog } from "@/features/wishlist/components/wishlist-item-dialog";
import { FigmaPage, FigmaPageHeader, FigmaPageTitle } from "@/components/ui/figma";
import { useConfirmDelete } from "@/components/ui/confirm-delete-dialog";
import { PrepBodySkeleton, PrepPageSkeleton } from "@/components/ui/page-skeleton";
import type { WishlistItem } from "@/mocks/fixtures/wishlist";

function WishlistCard({
  item,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  onEdit: (values: { icon: string; title: string; content?: string }) => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex w-full flex-col items-start rounded-[20px] bg-white px-4 pt-5 pb-4 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
      <ExpandableCardBody label={item.title} className="flex w-full flex-col items-start gap-1.5">
        {(expanded) => (
          <>
            <p
              className={cn(
                "w-full pr-12 break-words text-[14px] leading-[21px] font-bold text-[#4A4543]",
                expanded ? "whitespace-pre-wrap" : "line-clamp-2",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg p-0.5",
                    memoIconBg(resolveMemoIcon(item.icon)),
                  )}
                >
                  <Glyph value={item.icon} className="size-5" />
                </span>
                {item.title}
              </span>
            </p>
            {item.content ? (
              <p
                className={cn(
                  "w-full break-words text-[13px] leading-[21px] font-normal text-[#8C8885]",
                  expanded ? "whitespace-pre-wrap" : "line-clamp-2",
                )}
              >
                {item.content}
              </p>
            ) : null}
          </>
        )}
      </ExpandableCardBody>
      <div className="absolute top-5 right-4 flex items-start gap-0">
        <WishlistItemDialog
          initial={item}
          onSubmit={onEdit}
          trigger={<IconAction action="edit" label={`${item.title} 편집`} className="size-6" />}
        />
        <IconAction
          action="delete"
          label={`${item.title} 삭제`}
          className="size-6"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

export function MemoTab({ tripId, embedded }: { tripId: string; embedded?: boolean }) {
  const { data, isLoading, isError } = useWishlist(tripId);
  const createItem = useCreateWishlistItem(tripId);
  const updateItem = useUpdateWishlistItem(tripId);
  const deleteItem = useDeleteWishlistItem(tripId);
  const { request: askDelete, dialog: confirmDialog } = useConfirmDelete();
  const items = (data ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex);

  if (isLoading) return embedded ? <PrepBodySkeleton /> : <PrepPageSkeleton />;
  if (isError) {
    return (
      <p className="p-6 text-[12px] leading-[18px] font-semibold text-[#E85D4C]">
        메모를 다시 불러와 주세요.
      </p>
    );
  }

  const body = (
    <>
      <div className="flex h-[38px] w-full items-start justify-end">
        <p className="sr-only">📝 위시리스트 & 메모</p>
        <WishlistItemDialog
          onSubmit={(values) => createItem.mutateAsync({ tripId, orderIndex: items.length, ...values })}
          trigger={
            <button
              type="button"
              className="flex h-[38px] items-center justify-center rounded-[16px] bg-[#FF9F43] px-4 py-[9px] text-[13px] leading-5 font-bold text-white shadow-[0px_8px_24px_rgba(255,159,67,0.25)]"
            >
              + 끄적이기
            </button>
          }
        />
      </div>

      {items.length === 0 ? (
        <p className="w-full py-6 text-center text-[13px] leading-5 text-[#8E8E8E]">
          아직 남겨둔 낙서가 없어!
        </p>
      ) : (
        <div className="flex w-full flex-col items-start gap-2.5">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onEdit={(values) => updateItem.mutateAsync({ id: item.id, patch: values })}
              onDelete={() => askDelete(() => deleteItem.mutate(item.id))}
            />
          ))}
        </div>
      )}
      {confirmDialog}
    </>
  );

  if (embedded) {
    return <div className="flex w-full flex-col items-start gap-4">{body}</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <FigmaPageHeader>
        <FigmaPageTitle>제주에서 슬쩍 하고 싶은 것들</FigmaPageTitle>
      </FigmaPageHeader>
      <FigmaPage>{body}</FigmaPage>
    </div>
  );
}
