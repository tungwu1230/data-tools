import { useState } from "react";
import { CSS } from "./styles.js";
import { useCsvFiles } from "./hooks/useCsvFiles.js";
import { useJoinConfig } from "./hooks/useJoinConfig.js";
import { useCollections } from "./hooks/useCollections.js";
import { useCollectionSidebar } from "./hooks/useCollectionSidebar.js";
import { useColumnSelection } from "./hooks/useColumnSelection.js";
import { useOutputColumns } from "./hooks/useOutputColumns.js";
import { useMerge } from "./hooks/useMerge.js";
import StepTab from "./components/StepTab.jsx";
import CollectionsSidebar from "./components/CollectionsSidebar.jsx";
import StepFiles from "./components/StepFiles.jsx";
import StepMergeConfig from "./components/StepMergeConfig.jsx";
import StepOutput from "./components/StepOutput.jsx";
import StepPreview from "./components/StepPreview.jsx";
import ColumnSelectionSidebar from "./components/ColumnSelectionSidebar.jsx";
import ExploreMode from "./components/ExploreMode.jsx";
import { ArrowLeft, ArrowRight, Activity, GitMerge } from "lucide-react";

import StepDataQuality from "./components/StepDataQuality.jsx";

export default function CsvMergeWorkbench({ storage }) {
  const [mode, setMode] = useState("merge"); // "merge" | "explore" — explore mode works right after upload, independent of wizard step-gating
  const [step, setStep] = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [previewOpen, setPreviewOpen] = useState({});
  const [activeFileId, setActiveFileId] = useState(null);

  const { files, loadingFiles, fileInputRef, handleUpload, removeFile, baseFileId, setBaseFileId, baseFile, others } = useCsvFiles();
  const { joinConfig, setJoinConfig, joinType, setJoinType } = useJoinConfig(files);
  const { collections, collectionsLoaded, createCollection, deleteCollection, updateCollection } = useCollections(storage);
  const columnSelection = useColumnSelection(files, collections);
  const outputColumns = useOutputColumns(files, columnSelection.selections);
  const { merged, exporting, exportCsv } = useMerge(step, baseFile, others, outputColumns.outputCols, joinConfig, joinType);
  const sidebar = useCollectionSidebar({ files, collections, createCollection, updateCollection });

  const canStep2 = files.length > 0 && outputColumns.outputCols.length > 0;
  const canStep3 = canStep2 && (files.length <= 1 || others.every((f) => joinConfig[f.id]?.theirKey && joinConfig[f.id]?.baseKey));
  const canStep4 = canStep3 && outputColumns.outputCols.length > 0;
  const canStep5 = canStep4 && merged && merged.total > 0;

  const isNextDisabled = () => {
    if (step === 1) return !canStep2;
    if (step === 2) return !canStep3;
    if (step === 3) return !canStep4;
    if (step === 4) return !canStep5;
    return true;
  };

  return (
    <div className="wb">
      <style>{CSS}</style>

      {mode === "merge" && (
        <CollectionsSidebar
          collections={collections}
          collectionsLoaded={collectionsLoaded}
          deleteCollection={deleteCollection}
          files={files}
          sidebarMode={sidebar.sidebarMode}
          createMode={sidebar.createMode}
          setCreateMode={sidebar.setCreateMode}
          createName={sidebar.createName}
          setCreateName={sidebar.setCreateName}
          manualText={sidebar.manualText}
          setManualText={sidebar.setManualText}
          fromDataFileId={sidebar.fromDataFileId}
          setFromDataFileId={sidebar.setFromDataFileId}
          fromDataChecked={sidebar.fromDataChecked}
          toggleFromDataChecked={sidebar.toggleFromDataChecked}
          fromDataFilterText={sidebar.fromDataFilterText}
          setFromDataFilterText={sidebar.setFromDataFilterText}
          editingId={sidebar.editingId}
          openCreateBlank={sidebar.openCreateBlank}
          openEditCollection={sidebar.openEditCollection}
          cancelCreate={sidebar.cancelCreate}
          saveCollection={sidebar.saveCollection}
        />
      )}

      <div className="wb-main">
        <div className="wb-head">
          <div className="wb-mode-toggle">
            <button
              className={`wb-mode-btn ${mode === "merge" ? "active" : ""}`}
              onClick={() => setMode("merge")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <GitMerge size={13} />
              <span>合併模式</span>
            </button>
            <button
              className={`wb-mode-btn ${mode === "explore" ? "active" : ""}`}
              onClick={() => setMode("explore")}
              disabled={files.length === 0}
              title={files.length === 0 ? "請先上傳至少一份 CSV" : "檢視欄位分佈，不需先完成合併設定"}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Activity size={13} />
              <span>探索模式</span>
            </button>
          </div>

          {mode === "merge" && (
            <div className="wb-steps">
              <StepTab n={1} label="檔案與欄位" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
              <StepTab n={2} label="合併設定" active={step === 2} done={step > 2} onClick={() => canStep2 && setStep(2)} disabled={!canStep2} />
              <StepTab n={3} label="輸出設定" active={step === 3} done={step > 3} onClick={() => canStep3 && setStep(3)} disabled={!canStep3} />
              <StepTab n={4} label="預覽與匯出" active={step === 4} done={step > 4} onClick={() => canStep4 && setStep(4)} disabled={!canStep4} />
              <StepTab n={5} label="資料品質報告" active={step === 5} done={false} onClick={() => canStep5 && setStep(5)} disabled={!canStep5} />
            </div>
          )}
        </div>

        <div className={`wb-body ${mode === "merge" && step === 1 ? "flush" : "padded"}`}>
          {mode === "explore" && <ExploreMode files={files} />}
          {mode === "merge" && step === 1 && (
            <StepFiles
              files={files} loadingFiles={loadingFiles} fileInputRef={fileInputRef} handleUpload={handleUpload} removeFile={removeFile}
              collapsed={collapsed} setCollapsed={setCollapsed} previewOpen={previewOpen} setPreviewOpen={setPreviewOpen}
              selections={columnSelection.selections} toggleColumn={columnSelection.toggleColumn} visibleHeaders={columnSelection.visibleHeaders}
              filterMode={columnSelection.filterMode} updateFilter={columnSelection.updateFilter} clearFilter={columnSelection.clearFilter}
              selectAllVisible={columnSelection.selectAllVisible} clearVisible={columnSelection.clearVisible}
              collections={collections} openCreateFromFile={sidebar.openCreateFromFile}
              baseFileId={baseFileId} setBaseFileId={setBaseFileId} others={others} joinConfig={joinConfig} setJoinConfig={setJoinConfig}
              activeFileId={activeFileId} setActiveFileId={setActiveFileId}
            />
          )}
          {mode === "merge" && step === 2 && (
            <StepMergeConfig
              files={files} baseFileId={baseFileId} setBaseFileId={setBaseFileId}
              others={others} joinConfig={joinConfig} setJoinConfig={setJoinConfig}
              joinType={joinType} setJoinType={setJoinType}
              selections={columnSelection.selections}
              outputCols={outputColumns.outputCols}
            />
          )}
          {mode === "merge" && step === 3 && (
            <StepOutput
              files={files} collections={collections}
              outputCols={outputColumns.outputCols} selectedOutIds={outputColumns.selectedOutIds} toggleOutSelect={outputColumns.toggleOutSelect}
              selectAllOut={outputColumns.selectAllOut} clearOutSel={outputColumns.clearOutSel}
              selectOutIds={outputColumns.selectOutIds} deselectOutIds={outputColumns.deselectOutIds}
              prefixVal={outputColumns.prefixVal} setPrefixVal={outputColumns.setPrefixVal} suffixVal={outputColumns.suffixVal} setSuffixVal={outputColumns.setSuffixVal}
              applyPrefixSuffix={outputColumns.applyPrefixSuffix} reorderOutputCols={outputColumns.reorderOutputCols} renameOutputCol={outputColumns.renameOutputCol}
              resetOutputName={outputColumns.resetOutputName} resetSelectedOutputNames={outputColumns.resetSelectedOutputNames}
            />
          )}
          {mode === "merge" && step === 4 && (
            <StepPreview merged={merged} exporting={exporting} exportCsv={exportCsv} goToStep5={() => setStep(5)} />
          )}
          {mode === "merge" && step === 5 && (
            <StepDataQuality merged={merged} baseFile={baseFile} files={files} exportCsv={exportCsv} exporting={exporting} />
          )}
        </div>

        {mode === "merge" && (
          <div className="wb-foot">
            <button
              className="btn ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ArrowLeft size={14} />
              <span>上一步</span>
            </button>
            {step < 5 ? (
              <button
                className="btn primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                disabled={isNextDisabled()}
                onClick={() => setStep((s) => s + 1)}
              >
                <span>{step === 4 ? "查看資料品質報告" : "下一步"}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="btn primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={exportCsv}
                disabled={exporting || !merged || merged.total === 0}
              >
                <span>{exporting ? "匯出中…" : "匯出 CSV"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {mode === "merge" && step === 1 && files.length > 0 && (
        <ColumnSelectionSidebar
          files={files}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          selections={columnSelection.selections}
          toggleColumn={columnSelection.toggleColumn}
          visibleHeaders={columnSelection.visibleHeaders}
          filterMode={columnSelection.filterMode}
          updateFilter={columnSelection.updateFilter}
          clearFilter={columnSelection.clearFilter}
          selectAllVisible={columnSelection.selectAllVisible}
          clearVisible={columnSelection.clearVisible}
          collections={collections}
          openCreateFromFile={sidebar.openCreateFromFile}
        />
      )}
    </div>
  );
}
