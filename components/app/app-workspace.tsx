"use client";

import { useRef, useState } from "react";
import ScreenshotSearch, { type ScreenshotSearchHandle } from "@/components/app/screenshot-search";
import EntityBrowser from "@/components/app/entity-browser";
import ScreenshotUploader from "@/components/app/screenshot-uploader";
import UsageStatus from "@/components/app/usage-status";

export default function AppWorkspace() {
  const searchRef = useRef<ScreenshotSearchHandle>(null);
  const [uploadVersion, setUploadVersion] = useState(0);

  return (
    <>
      <div className="mx-auto mt-12 max-w-2xl">
        <ScreenshotSearch ref={searchRef} />
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <EntityBrowser
          refreshKey={uploadVersion}
          onSelectEntity={(name) => searchRef.current?.search(name)}
        />
      </div>

      <div id="upload" className="mt-16 scroll-mt-28">
        <div className="mb-6">
          <UsageStatus refreshKey={uploadVersion} />
        </div>
        <ScreenshotUploader onUploadComplete={() => setUploadVersion((v) => v + 1)} />
      </div>
    </>
  );
}
