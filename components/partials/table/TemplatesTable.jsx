/* eslint-disable react/display-name */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "./GlobalFilter";
import TemplateModal from "./TemplateModal";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";

const COLUMNS = [
  {
    Header: "Id",
    accessor: "_id",
    Cell: (row) => {
      const id = row?.cell?.value || row?.row?.original?.id;
      return <span>{id?.toString().substring(0, 8) || "N/A"}</span>;
    },
  },
  {
    Header: "Template",
    accessor: "name",
    Cell: (row) => {
      const template = row.row.original;
      const { onPreview } = row.row.original;
      return (
        <div>
          <span className="inline-flex items-center">
            <span 
              className="w-10 h-10 rounded ltr:mr-3 rtl:ml-3 flex-none bg-slate-600 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPreview && onPreview(template)}
            >
              <img
                src={template.thumbnail || "/assets/images/templates/default.jpg"}
                alt={template.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.src = "/assets/images/templates/default.jpg";
                }}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {template.name}
              </span>
              {template.description && (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {template.description}
                </span>
              )}
            </div>
          </span>
        </div>
      );
    },
  },
  {
    Header: "Category",
    accessor: "category",
    Cell: (row) => {
      return <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Render Engine",
    accessor: "renderEngine",
    Cell: (row) => {
      const engine = row?.cell?.value || "builder";
      return (
        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded capitalize">
          {engine}
        </span>
      );
    },
  },
  {
    Header: "Tags",
    accessor: "tags",
    Cell: (row) => {
      const tags = row?.cell?.value || [];
      if (tags.length === 0) return <span className="text-sm text-slate-400">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-slate-500">+{tags.length - 2}</span>
          )}
        </div>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: (row) => {
      const template = row.row.original;
      const status = template.status || (template.isActive ? "active" : "inactive");
      const badges = [];
      
      if (template.isPremium) {
        badges.push(
          <span key="premium" className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded mr-1">
            Premium
          </span>
        );
      }
      if (template.isPopular) {
        badges.push(
          <span key="popular" className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded mr-1">
            Popular
          </span>
        );
      }
      if (template.isNewTemplate) {
        badges.push(
          <span key="new" className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded mr-1">
            New
          </span>
        );
      }
      
      return (
        <div className="flex flex-col space-y-1">
          <span
            className={`inline-block px-3 min-w-[90px] text-center py-1 rounded-[999px] bg-opacity-25 ${
              status === "active"
                ? "text-success-500 bg-success-500"
                : ""
            } 
            ${
              status === "inactive"
                ? "text-danger-500 bg-danger-500"
                : ""
            }
            ${
              status === "draft"
                ? "text-warning-500 bg-warning-500"
                : ""
            }`}
          >
            {status}
          </span>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges}
            </div>
          )}
        </div>
      );
    },
  },
  {
    Header: "Created By",
    accessor: "createdBy",
    Cell: (row) => {
      return <span className="text-sm text-slate-600 dark:text-slate-300">{row?.cell?.value || "System"}</span>;
    },
  },
  {
    Header: "Created",
    accessor: "createdAt",
    Cell: (row) => {
      const date = row?.cell?.value;
      if (!date) return <span className="text-sm text-slate-600 dark:text-slate-300">-</span>;
      const formattedDate = new Date(date).toLocaleDateString();
      return <span className="text-sm text-slate-600 dark:text-slate-300">{formattedDate}</span>;
    },
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: (row) => {
      const { onEdit, onDelete } = row.row.original;
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="Edit in Modal" placement="top" arrow animation="shift-away">
            <button
              className="action-btn"
              type="button"
              onClick={() => onEdit(row.row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
            </button>
          </Tooltip>
          <Tooltip content="Edit in Canvas" placement="top" arrow animation="shift-away">
            <button
              className="action-btn"
              type="button"
              onClick={() => {
                const templateId = row.row.original._id || row.row.original.id;
                window.location.href = `/templates/${templateId}/edit`;
              }}
            >
              <Icon icon="heroicons:paint-brush" />
            </button>
          </Tooltip>
          <Tooltip
            content="Delete"
            placement="top"
            arrow
            animation="shift-away"
            theme="danger"
          >
            <button
              className="action-btn"
              type="button"
              onClick={() => onDelete(row.row.original)}
            >
              <Icon icon="heroicons:trash" />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          className="table-checkbox"
        />
      </>
    );
  }
);

const TemplatesTable = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/templates");
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        toast.error(result.error || "Failed to fetch templates");
      }
    } catch (error) {
      toast.error("Error fetching templates: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = async (template) => {
    if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
      try {
        const templateId = template._id || template.id;
        const response = await fetch(`/api/templates/${templateId}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Template deleted successfully");
          fetchTemplates(); // Refresh the list
        } else {
          toast.error(result.error || "Failed to delete template");
        }
      } catch (error) {
        toast.error("Error deleting template: " + error.message);
      }
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const templateId = selectedTemplate?._id || selectedTemplate?.id;
      const url = isEditMode ? `/api/templates/${templateId}` : "/api/templates";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "Template updated successfully" : "Template created successfully"
        );
        setIsModalOpen(false);
        setSelectedTemplate(null);
        fetchTemplates(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch (error) {
      toast.error("Error saving template: " + error.message);
    }
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setIsPreviewModalOpen(true);
  };

  // Add onEdit, onDelete, and onPreview to each template object for the table
  const tableData = useMemo(() => {
    return templates.map((template) => ({
      ...template,
      onEdit: handleEditTemplate,
      onDelete: handleDeleteTemplate,
      onPreview: handlePreviewTemplate,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  const columns = useMemo(() => COLUMNS, []);

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      initialState: {
        pageSize: 10,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading templates...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Templates Management</h4>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons:plus"
              text="Add Template"
              className="btn-primary"
              onClick={handleAddTemplate}
            />
            <Button
              icon="heroicons:paint-brush"
              text="Create with Canvas"
              className="btn-primary"
              onClick={() => {
                window.location.href = "/templates/new/edit";
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="bg-slate-200 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => {
                    const { key, ...restHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={key} {...restHeaderGroupProps}>
                        {headerGroup.headers.map((column) => {
                          const { key, ...restColumn } = column.getHeaderProps(
                            column.getSortByToggleProps()
                          );
                          return (
                            <th
                              key={key}
                              {...restColumn}
                              scope="col"
                              className="table-th"
                            >
                              {column.render("Header")}
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                  : ""}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {page.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="table-td text-center py-8">
                        <p className="text-slate-600 dark:text-slate-300">No templates found</p>
                      </td>
                    </tr>
                  ) : (
                    page.map((row) => {
                      prepareRow(row);
                      const { key, ...restRowProps } = row.getRowProps();
                      return (
                        <tr key={key} {...restRowProps}>
                          {row.cells.map((cell) => {
                            const { key, ...restCellProps } = cell.getCellProps();
                            return (
                              <td
                                key={key}
                                {...restCellProps}
                                className="table-td"
                              >
                                {cell.render("Cell")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page{" "}
              <span>
                {pageIndex + 1} of {pageOptions.length}
              </span>
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse flex-wrap">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${
                  !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${
                  !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                Prev
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx}>
                <button
                  aria-current="page"
                  className={`${
                    pageIdx === pageIndex
                      ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium"
                      : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal"
                  } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${
                  !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                Next
              </button>
            </li>
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className={`${
                  !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>
        </div>
      </Card>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
        isEdit={isEditMode}
      />

      {/* Preview Modal */}
      <Modal
        activeModal={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewTemplate(null);
        }}
        title={previewTemplate ? previewTemplate.name : "Template Preview"}
        className="max-w-4xl"
        centered
        scrollContent
      >
        {previewTemplate && (
          <div className="flex justify-center items-center bg-white dark:bg-slate-800 rounded-lg p-4">
            <img
              src={previewTemplate.thumbnail || "/assets/images/templates/default.jpg"}
              alt={previewTemplate.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = "/assets/images/templates/default.jpg";
              }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default TemplatesTable;

