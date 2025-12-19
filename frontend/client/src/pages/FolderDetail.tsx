import React, { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MediaCard } from "@/components/library/MediaCard";
import { DetailModal } from "@/components/library/DetailModal";
import { Pagination } from "@/components/library/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { MOCK_LIBRARY, MediaItem } from "@/lib/mockData";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FolderDetail() {
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const filesInFolder = MOCK_LIBRARY.filter((item) => item.type !== "folder").slice(0, 15);

  const pagination = usePagination(filesInFolder, 12);

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handlePlay = (item: MediaItem) => {
    console.log("Playing", item.title);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Project Data Archive</h1>
              <p className="text-muted-foreground">142 files • 850 MB total</p>
            </div>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
            <Download className="w-4 h-4" /> Download All
          </Button>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 auto-rows-max">
          {pagination.currentItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={() => handleSelect(item)}
              onPlay={() => handlePlay(item)}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      </div>

      <DetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}
