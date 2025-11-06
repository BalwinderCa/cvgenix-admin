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
import FAQModal from "./FAQModal";
import { toast } from "react-toastify";

const COLUMNS = [
  {
    Header: "Question",
    accessor: "question",
    Cell: (row) => {
      const question = row?.cell?.value || "";
      return (
        <div className="max-w-md">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {question}
          </span>
        </div>
      );
    },
  },
  {
    Header: "Answer",
    accessor: "answer",
    Cell: (row) => {
      const answer = row?.cell?.value || "";
      return (
        <div className="max-w-lg">
          <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {answer}
          </span>
        </div>
      );
    },
  },
  {
    Header: "Category",
    accessor: "category",
    Cell: (row) => {
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
          {row?.cell?.value || "General"}
        </span>
      );
    },
  },
  {
    Header: "Order",
    accessor: "order",
    Cell: (row) => {
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row?.cell?.value || 0}
        </span>
      );
    },
  },
  {
    Header: "Status",
    accessor: "isActive",
    Cell: (row) => {
      const isActive = row?.cell?.value;
      return (
        <span
          className={`text-xs px-2 py-1 rounded ${
            isActive
              ? "bg-success-500 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    Header: "Featured",
    accessor: "isFeatured",
    Cell: (row) => {
      const isFeatured = row?.cell?.value;
      return isFeatured ? (
        <Icon icon="heroicons:star" className="w-5 h-5 text-warning-500" />
      ) : (
        <span className="text-slate-400">-</span>
      );
    },
  },
  {
    Header: "Actions",
    accessor: "actions",
    Cell: (row) => {
      const { onEdit, onDelete } = row.row.original;
      return (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Tooltip content="Edit">
            <button
              type="button"
              className="action-btn"
              onClick={() => onEdit && onEdit(row.row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
            </button>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              type="button"
              className="action-btn"
              onClick={() => onDelete && onDelete(row.row.original)}
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

const FAQTable = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faqs");
      const result = await response.json();
      if (result.success) {
        setFaqs(result.data || []);
      } else {
        toast.error("Error fetching FAQs: " + result.error);
      }
    } catch (error) {
      toast.error("Error fetching FAQs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = () => {
    setSelectedFAQ(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditFAQ = (faq) => {
    setSelectedFAQ(faq);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteFAQ = async (faq) => {
    if (!window.confirm(`Are you sure you want to delete "${faq.question}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/faqs/${faq._id || faq.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast.success("FAQ deleted successfully");
        fetchFAQs();
      } else {
        toast.error("Error deleting FAQ: " + result.error);
      }
    } catch (error) {
      toast.error("Error deleting FAQ: " + error.message);
    }
  };

  const handleSaveFAQ = async (faqData) => {
    try {
      const faqId = selectedFAQ?._id || selectedFAQ?.id;
      const url = isEditMode ? `/api/faqs/${faqId}` : "/api/faqs";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "FAQ updated successfully" : "FAQ created successfully"
        );
        setIsModalOpen(false);
        setSelectedFAQ(null);
        fetchFAQs();
      } else {
        toast.error(result.error || "Failed to save FAQ");
      }
    } catch (error) {
      toast.error("Error saving FAQ: " + error.message);
    }
  };

  const tableData = useMemo(() => {
    return faqs.map((faq) => ({
      ...faq,
      onEdit: handleEditFAQ,
      onDelete: handleDeleteFAQ,
    }));
  }, [faqs]);

  const columns = useMemo(() => COLUMNS, []);

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
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
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex } = state;

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Frequently Asked Questions</h4>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons-outline:plus"
              text="Add FAQ"
              className="btn-primary"
              onClick={handleAddFAQ}
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="bg-slate-50 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          scope="col"
                          className=" table-th "
                        >
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <span>{column.render("Header")}</span>
                            {column.isSorted && (
                              <span>
                                {column.isSortedDesc ? (
                                  <Icon icon="heroicons:chevron-up" />
                                ) : (
                                  <Icon icon="heroicons:chevron-down" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {page.length > 0 ? (
                    page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => {
                            return (
                              <td {...cell.getCellProps()} className="table-td">
                                {cell.render("Cell")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={headerGroups[0].headers.length}
                        className="text-center py-8 text-slate-500"
                      >
                        No FAQs found. Click "Add FAQ" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:flex-row md:items-center md:justify-between py-4 md:py-6 flex-wrap gap-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {pageIndex + 1} of {pageOptions.length}
            </span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              icon="heroicons:chevron-left"
              className="btn-default btn-sm"
              disabled={!canPreviousPage}
              onClick={() => previousPage()}
            />
            <Button
              icon="heroicons:chevron-right"
              iconPosition="right"
              className="btn-default btn-sm"
              disabled={!canNextPage}
              onClick={() => nextPage()}
            />
          </div>
        </div>
      </Card>

      <FAQModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFAQ(null);
        }}
        onSave={handleSaveFAQ}
        faq={selectedFAQ}
        isEdit={isEditMode}
      />
    </>
  );
};

export default FAQTable;

