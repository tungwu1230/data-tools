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
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CsvMergeWorkbench() {
  const [step, setStep] = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [previewOpen, setPreviewOpen] = useState({});
  const [activeFileId, setActiveFileId] = useState(null);

  const { files, loadingFiles, fileInputRef, handleUpload, removeFile, baseFileId, setBaseFileId, baseFile, others } = useCsvFiles();
  const { joinConfig, setJoinConfig } = useJoinConfig(files);
  const { collections, collectionsLoaded, createCollection, deleteCollection, updateCollection } = useCollections();
  const columnSelection = useColumnSelection(files, collections);
  const outputColumns = useOutputColumns(files, columnSelection.selections);
  const { merged, exporting, exportCsv } = useMerge(step, baseFile, others, outputColumns.outputCols, joinConfig);
  const sidebar = useCollectionSidebar({ files, collections, createCollection, updateCollection });

  // keep the step-1 checkbox in sync when a column is dropped from the output list in step 3
  const removeOutputCol = (oc) => {
    outputColumns.removeOutputCol(oc.id);
    columnSelection.deselectColumn(oc.fileId, oc.column);
  };

  const canStep2 = files.length > 0 && outputColumns.outputCols.length > 0;
  const canStep3 = canStep2 && (files.length <= 1 || others.every((f) => joinConfig[f.id]?.theirKey && joinConfig[f.id]?.baseKey));
  const canStep4 = canStep3 && outputColumns.outputCols.length > 0;

  const isNextDisabled = () => {
    if (step === 1) return !canStep2;
    if (step === 2) return !canStep3;
    if (step === 3) return !canStep4;
    return true;
  };

  return (
    <div className="wb">
      <style>{CSS}</style>

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

      <div className="wb-main">
        <div className="wb-head">
          <p className="wb-title">CSV 合併工作台</p>
          <p className="wb-sub">上傳 CSV → 挑選欄位 → 合併設定 → 輸出設定 → 匯出合併結果</p>
          <div className="wb-steps">
            <StepTab n={1} label="檔案與欄位" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
            <StepTab n={2} label="合併設定" active={step === 2} done={step > 2} onClick={() => canStep2 && setStep(2)} disabled={!canStep2} />
            <StepTab n={3} label="輸出設定" active={step === 3} done={step > 3} onClick={() => canStep3 && setStep(3)} disabled={!canStep3} />
            <StepTab n={4} label="預覽與匯出" active={step === 4} done={false} onClick={() => canStep4 && setStep(4)} disabled={!canStep4} />
          </div>
        </div>

        <div className="wb-body">
          {step === 1 && (
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
          {step === 2 && (
            <StepMergeConfig
              files={files} baseFileId={baseFileId} setBaseFileId={setBaseFileId}
              others={others} joinConfig={joinConfig} setJoinConfig={setJoinConfig}
            />
          )}
          {step === 3 && (
            <StepOutput
              files={files} collections={collections}
              outputCols={outputColumns.outputCols} selectedOutIds={outputColumns.selectedOutIds} toggleOutSelect={outputColumns.toggleOutSelect}
              selectAllOut={outputColumns.selectAllOut} clearOutSel={outputColumns.clearOutSel}
              selectOutIds={outputColumns.selectOutIds} deselectOutIds={outputColumns.deselectOutIds}
              prefixVal={outputColumns.prefixVal} setPrefixVal={outputColumns.setPrefixVal} suffixVal={outputColumns.suffixVal} setSuffixVal={outputColumns.setSuffixVal}
              applyPrefixSuffix={outputColumns.applyPrefixSuffix} reorderOutputCols={outputColumns.reorderOutputCols} renameOutputCol={outputColumns.renameOutputCol}
              resetOutputName={outputColumns.resetOutputName} resetSelectedOutputNames={outputColumns.resetSelectedOutputNames} removeOutputCol={removeOutputCol}
            />
          )}
          {step === 4 && (
            <StepPreview merged={merged} exporting={exporting} exportCsv={exportCsv} outputCols={outputColumns.outputCols} baseFile={baseFile} />
          )}
        </div>

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
          {step < 4 ? (
            <button
              className="btn primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              disabled={isNextDisabled()}
              onClick={() => setStep((s) => s + 1)}
            >
              <span>下一步</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{merged ? `共 ${merged.total} 列 · ${outputColumns.outputCols.length} 欄` : ""}</span>
          )}
        </div>
      </div>

      {step === 1 && files.length > 0 && (
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
