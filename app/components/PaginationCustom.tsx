import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function PaginationCustom({
  page,
  count,
  setPage,
}: {
  page: number;
  count: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleNext = () => {
    if (page < count) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const getVisiblePages = () => {
    const visiblePages: number[] = [];
    if (count <= 5) {
      for (let i = 1; i <= count; i++) visiblePages.push(i);
    } else {
      if (page > 1) visiblePages.push(page - 1);
      visiblePages.push(page);
      if (page < count) visiblePages.push(page + 1);
    }
    return visiblePages;
  };

  return (
    <Pagination className="z-10 col-span-full">
      <PaginationContent className="flex items-center gap-4 ">
        <PaginationItem>
          <Button
            disabled={page === 1}
            className={`${page === count ? " bg-rose-400" : ""}   flex items-center gap-2`}
            onClick={handlePrev}
          >
            <ArrowLeft className="mr-1" /> Prev
          </Button>
        </PaginationItem>
        <PaginationItem className={`${page === count ? " bg-rose-400" : ""}`}>
          <PaginationLink onClick={() => setPage(1)} className={`${page === 1 ? " bg-rose-400" : ""}`}>
            1
          </PaginationLink>
        </PaginationItem>

        {page > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {getVisiblePages().map((p) => (
          <PaginationItem key={p}>
            <PaginationLink onClick={() => setPage(p)} className={`${page === p ? " bg-rose-400" : ""}`}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {page < count - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {count > 1 && page < count && (
          <PaginationItem className={`${page === count ? " bg-rose-400" : ""}`}>
            <PaginationLink onClick={() => setPage(count)} className={`${page === count ? " bg-rose-400" : ""}`}>
              {count}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <Button
            disabled={page === count}
            className={`${page === count ? " bg-rose-400" : ""} flex items-center gap-2`}
            onClick={handleNext}
          >
            Next <ArrowRight className="mr-1" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
