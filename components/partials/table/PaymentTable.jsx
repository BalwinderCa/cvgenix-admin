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
import PaymentModal from "./PaymentModal";
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
    Header: "User",
    accessor: "userName",
    Cell: (row) => {
      const payment = row.row.original;
      return (
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {payment.userName}
          </span>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {payment.userEmail}
          </div>
        </div>
      );
    },
  },
  {
    Header: "Amount",
    accessor: "amount",
    Cell: (row) => {
      const payment = row.row.original;
      return (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {payment.currency} {payment.amount?.toFixed(2)}
        </span>
      );
    },
  },
  {
    Header: "Payment Method",
    accessor: "paymentMethod",
    Cell: (row) => {
      const method = row?.cell?.value || "";
      const formattedMethod = method
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
          {formattedMethod}
        </span>
      );
    },
  },
  {
    Header: "Transaction ID",
    accessor: "transactionId",
    Cell: (row) => {
      const txId = row?.cell?.value || "";
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
          {txId.substring(0, 20)}...
        </span>
      );
    },
  },
  {
    Header: "Plan",
    accessor: "planName",
    Cell: (row) => {
      const planName = row?.cell?.value || "N/A";
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {planName}
        </span>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: (row) => {
      const status = row?.cell?.value || "";
      return (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              status === "completed"
                ? "text-success-500 bg-success-500"
                : ""
            } 
            ${
              status === "failed" || status === "cancelled"
                ? "text-danger-500 bg-danger-500"
                : ""
            }
            ${
              status === "pending"
                ? "text-warning-500 bg-warning-500"
                : ""
            }
            ${
              status === "refunded"
                ? "text-info-500 bg-info-500"
                : ""
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
      const { onEdit, onDelete } = row.row.original;
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
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

const PaymentTable = () => {
  const [payments, setPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments");
      const result = await response.json();
      
      if (result.success) {
        setPayments(result.data);
      } else {
        toast.error(result.error || "Failed to fetch payments");
      }
    } catch (error) {
      toast.error("Error fetching payments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeletePayment = async (payment) => {
    const paymentName = payment.transactionId || "this payment";
    if (window.confirm(`Are you sure you want to delete payment ${paymentName}?`)) {
      try {
        const paymentId = payment._id || payment.id;
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Payment deleted successfully");
          fetchPayments(); // Refresh the list
        } else {
          toast.error(result.error || "Failed to delete payment");
        }
      } catch (error) {
        toast.error("Error deleting payment: " + error.message);
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const paymentId = selectedPayment?._id || selectedPayment?.id;
      const url = isEditMode ? `/api/payments/${paymentId}` : "/api/payments";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "Payment updated successfully" : "Payment created successfully"
        );
        setIsModalOpen(false);
        setSelectedPayment(null);
        fetchPayments(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to save payment");
      }
    } catch (error) {
      toast.error("Error saving payment: " + error.message);
    }
  };

  // Add onEdit and onDelete to each payment object for the table
  const tableData = useMemo(() => {
    return payments.map((payment) => ({
      ...payment,
      onEdit: handleEditPayment,
      onDelete: handleDeletePayment,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

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
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading payments...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Payments Management</h4>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons:plus"
              text="Add Payment"
              className="btn-primary"
              onClick={handleAddPayment}
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
                        <p className="text-slate-600 dark:text-slate-300">No payments found</p>
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

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        onSave={handleSavePayment}
        payment={selectedPayment}
        isEdit={isEditMode}
      />
    </>
  );
};

export default PaymentTable;






