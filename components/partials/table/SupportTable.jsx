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
import SupportModal from "./SupportModal";
import ViewSupportModal from "./ViewSupportModal";
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
    Header: "Name",
    accessor: "name",
    Cell: (row) => {
      return <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Email",
    accessor: "email",
    Cell: (row) => {
      return <span className="text-sm text-slate-600 dark:text-slate-300">{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Subject",
    accessor: "subject",
    Cell: (row) => {
      const subject = row?.cell?.value || "";
      const truncated = subject.length > 50 ? subject.substring(0, 50) + "..." : subject;
      return (
        <Tooltip content={subject} placement="top">
          <span className="text-sm text-slate-600 dark:text-slate-300">{truncated}</span>
        </Tooltip>
      );
    },
  },
  {
    Header: "Message",
    accessor: "message",
    Cell: (row) => {
      const message = row?.cell?.value || "";
      const truncated = message.length > 80 ? message.substring(0, 80) + "..." : message;
      return (
        <Tooltip content={message} placement="top">
          <span className="text-sm text-slate-600 dark:text-slate-300">{truncated}</span>
        </Tooltip>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: (row) => {
      const status = row?.cell?.value;
      const statusColors = {
        new: "text-primary-500 bg-primary-500",
        read: "text-info-500 bg-info-500",
        replied: "text-warning-500 bg-warning-500",
        resolved: "text-success-500 bg-success-500",
      };
      return (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 capitalize ${
              statusColors[status] || "text-slate-500 bg-slate-500"
            }`}
          >
            {status}
          </span>
        </span>
      );
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
      const { onEdit, onDelete, onView } = row.row.original;
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="View" placement="top" arrow animation="shift-away">
            <button
              className="action-btn"
              type="button"
              onClick={() => onView(row.row.original)}
            >
              <Icon icon="heroicons:eye" />
            </button>
          </Tooltip>
          <Tooltip content="Edit" placement="top" arrow animation="shift-away">
            <button
              className="action-btn"
              type="button"
              onClick={() => onEdit(row.row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
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

const SupportTable = () => {
  const [supportMessages, setSupportMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch support messages from API
  const fetchSupportMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/support");
      const result = await response.json();
      
      if (result.success) {
        setSupportMessages(result.data);
      } else {
        toast.error(result.error || "Failed to fetch support messages");
      }
    } catch (error) {
      toast.error("Error fetching support messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load support messages on component mount
  useEffect(() => {
    fetchSupportMessages();
  }, []);

  const handleAddSupport = () => {
    setSelectedSupport(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleViewSupport = (support) => {
    setSelectedSupport(support);
    setIsViewModalOpen(true);
  };

  const handleMarkAsRead = async (support) => {
    try {
      const supportId = support._id || support.id;
      const response = await fetch(`/api/support/${supportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...support,
          status: "read",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message marked as read");
        fetchSupportMessages(); // Refresh the list
        // Update the selected support in the view modal
        setSelectedSupport(result.data);
      } else {
        toast.error(result.error || "Failed to mark as read");
      }
    } catch (error) {
      toast.error("Error marking as read: " + error.message);
    }
  };

  const handleEditSupport = (support) => {
    setSelectedSupport(support);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteSupport = async (support) => {
    if (window.confirm(`Are you sure you want to delete this support message from ${support.name}?`)) {
      try {
        const supportId = support._id || support.id;
        const response = await fetch(`/api/support/${supportId}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Support message deleted successfully");
          fetchSupportMessages(); // Refresh the list
        } else {
          toast.error(result.error || "Failed to delete support message");
        }
      } catch (error) {
        toast.error("Error deleting support message: " + error.message);
      }
    }
  };

  const handleSaveSupport = async (supportData) => {
    try {
      const supportId = selectedSupport?._id || selectedSupport?.id;
      const url = isEditMode ? `/api/support/${supportId}` : "/api/support";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "Support message updated successfully" : "Support message created successfully"
        );
        setIsModalOpen(false);
        setSelectedSupport(null);
        fetchSupportMessages(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to save support message");
      }
    } catch (error) {
      toast.error("Error saving support message: " + error.message);
    }
  };

  // Add onEdit, onDelete, and onView to each support message object for the table
  const tableData = useMemo(() => {
    return supportMessages.map((support) => ({
      ...support,
      onEdit: handleEditSupport,
      onDelete: handleDeleteSupport,
      onView: handleViewSupport,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportMessages]);

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
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading support messages...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Support Messages Management</h4>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons:plus"
              text="Add Support Message"
              className="btn-primary"
              onClick={handleAddSupport}
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
                      <td colSpan={8} className="table-td text-center py-8">
                        <p className="text-slate-600 dark:text-slate-300">No support messages found</p>
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

      <SupportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupport(null);
        }}
        onSave={handleSaveSupport}
        support={selectedSupport}
        isEdit={isEditMode}
      />

      <ViewSupportModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSupport(null);
        }}
        support={selectedSupport}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};

export default SupportTable;

