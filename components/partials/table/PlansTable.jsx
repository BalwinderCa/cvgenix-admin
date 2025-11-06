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
import PlanModal from "./PlanModal";
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
    Header: "Plan Title",
    accessor: "title",
    Cell: (row) => {
      const plan = row.row.original;
      const title = plan.title || plan.name || "N/A";
      return (
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {title}
          </span>
          {plan.popular && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-primary-500 text-white rounded">
              Most Popular
            </span>
          )}
        </div>
      );
    },
  },
  {
    Header: "Subtitle",
    accessor: "subtitle",
    Cell: (row) => {
      const plan = row.row.original;
      const subtitle = plan.subtitle || plan.description || "";
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {subtitle}
        </span>
      );
    },
  },
  {
    Header: "Price",
    accessor: "price",
    Cell: (row) => {
      const plan = row.row.original;
      const priceType = plan.priceType || "one-time";
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          ${plan.price} / {priceType === "one-time" ? "one-time" : priceType}
        </span>
      );
    },
  },
  {
    Header: "Credits",
    accessor: "credits",
    Cell: (row) => {
      const plan = row.row.original;
      const credits = plan.credits || 0;
      const creditsDesc = plan.creditsDescription || "Resume + ATS Analysis";
      return (
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {credits} Credits
          </span>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {creditsDesc}
          </div>
        </div>
      );
    },
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: (row) => {
      return (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              row?.cell?.value === "active"
                ? "text-success-500 bg-success-500"
                : ""
            } 
            ${
              row?.cell?.value === "inactive"
                ? "text-danger-500 bg-danger-500"
                : ""
            }
            ${
              row?.cell?.value === "draft"
                ? "text-warning-500 bg-warning-500"
                : ""
            }`}
          >
            {row?.cell?.value}
          </span>
        </span>
      );
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

const PlansTable = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plans");
      const result = await response.json();
      
      if (result.success) {
        setPlans(result.data);
      } else {
        toast.error(result.error || "Failed to fetch plans");
      }
    } catch (error) {
      toast.error("Error fetching plans: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (plan) => {
    const planName = plan.title || plan.name || "this plan";
    if (window.confirm(`Are you sure you want to delete ${planName}?`)) {
      try {
        const planId = plan._id || plan.id;
        const response = await fetch(`/api/plans/${planId}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          toast.success("Plan deleted successfully");
          fetchPlans(); // Refresh the list
        } else {
          toast.error(result.error || "Failed to delete plan");
        }
      } catch (error) {
        toast.error("Error deleting plan: " + error.message);
      }
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      const planId = selectedPlan?._id || selectedPlan?.id;
      const url = isEditMode ? `/api/plans/${planId}` : "/api/plans";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "Plan updated successfully" : "Plan created successfully"
        );
        setIsModalOpen(false);
        setSelectedPlan(null);
        fetchPlans(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to save plan");
      }
    } catch (error) {
      toast.error("Error saving plan: " + error.message);
    }
  };

  // Add onEdit and onDelete to each plan object for the table
  const tableData = useMemo(() => {
    return plans.map((plan) => ({
      ...plan,
      onEdit: handleEditPlan,
      onDelete: handleDeletePlan,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

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
            <p className="mt-4 text-slate-600 dark:text-slate-300">Loading plans...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Plans Management</h4>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons:plus"
              text="Add Plan"
              className="btn-primary"
              onClick={handleAddPlan}
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
                  {page.map((row) => {
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:flex-wrap md:items-center md:justify-between py-4 md:py-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page
            </span>
            <span>
              <input
                type="number"
                className="form-control py-2"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(pageNumber);
                }}
                style={{ width: "50px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              of <strong>{pageOptions.length}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="btn-default btn-sm"
              icon="heroicons:chevron-left"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            />
            <Button
              className="btn-default btn-sm"
              icon="heroicons:chevron-right"
              onClick={() => nextPage()}
              disabled={!canNextPage}
            />
          </div>
        </div>
      </Card>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
        plan={selectedPlan}
        isEdit={isEditMode}
      />
    </>
  );
};

export default PlansTable;

