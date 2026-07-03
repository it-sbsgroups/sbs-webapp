"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";

export default function SearchLogsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [logs, setLogs] = useState([
    {
      id: 1,
      keyword: "Excavator",
      date: "2026-06-16",
      time: "10:20 AM",
      results: 12,
    },
    {
      id: 2,
      keyword: "Mining Equipment",
      date: "2026-06-16",
      time: "11:42 AM",
      results: 8,
    },
    {
      id: 3,
      keyword: "Crusher Machine",
      date: "2026-06-15",
      time: "09:30 AM",
      results: 14,
    },
    {
      id: 4,
      keyword: "Industrial Boiler",
      date: "2026-06-15",
      time: "02:18 PM",
      results: 5,
    },
    {
      id: 5,
      keyword: "Coal Handling Plant",
      date: "2026-06-14",
      time: "04:00 PM",
      results: 17,
    },
    {
      id: 6,
      keyword: "Conveyor Belt",
      date: "2026-06-13",
      time: "03:20 PM",
      results: 7,
    },
    {
      id: 7,
      keyword: "Heavy Machinery",
      date: "2026-06-12",
      time: "12:50 PM",
      results: 10,
    },
    {
      id: 8,
      keyword: "Hydraulic Pump",
      date: "2026-06-11",
      time: "09:15 AM",
      results: 6,
    },
    {
      id: 9,
      keyword: "Steel Structure",
      date: "2026-06-10",
      time: "01:45 PM",
      results: 4,
    },
    {
      id: 10,
      keyword: "Cement Plant",
      date: "2026-06-09",
      time: "08:25 AM",
      results: 13,
    },
    {
      id: 11,
      keyword: "Tower Crane",
      date: "2026-06-08",
      time: "10:00 AM",
      results: 11,
    },
    {
      id: 12,
      keyword: "Power Plant",
      date: "2026-06-07",
      time: "05:10 PM",
      results: 18,
    },
  ]);

  const filteredLogs = useMemo(() => {
    let data = [...logs];

    if (searchTerm.trim()) {
      data = data.filter((item) =>
        item.keyword
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(
    filteredLogs.length / pageSize
  );

  const paginatedData = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedData.map((x) => x.id);

    const allSelected = currentIds.every((id) =>
      selectedRows.includes(id)
    );

    if (allSelected) {
      setSelectedRows((prev) =>
        prev.filter((id) => !currentIds.includes(id))
      );
    } else {
      setSelectedRows((prev) => [
        ...new Set([...prev, ...currentIds]),
      ]);
    }
  };

  const deleteSingle = (id) => {
    if (!confirm("Delete this search log?")) return;

    setLogs((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSelectedRows((prev) =>
      prev.filter((item) => item !== id)
    );
  };

  const deleteSelected = () => {
    if (!selectedRows.length) return;

    if (
      !confirm(
        `Delete ${selectedRows.length} selected search logs?`
      )
    )
      return;

    setLogs((prev) =>
      prev.filter(
        (item) => !selectedRows.includes(item.id)
      )
    );

    setSelectedRows([]);
  };

  const deleteByFilter = () => {
    if (dateFilter === "all") return;

    if (
      !confirm(
        `Delete all logs for ${dateFilter}?`
      )
    )
      return;

    alert(
      `Backend API will delete all ${dateFilter} logs.`
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Search Logs Manager
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View, search, filter and manage user
          search history.
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Searches
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {logs.length}
          </h3>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Selected
          </p>

          <h3 className="mt-2 text-3xl font-bold text-blue-600">
            {selectedRows.length}
          </h3>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Current Page
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {currentPage}
          </h3>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Page Size
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {pageSize}
          </h3>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

              <input
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search keyword..."
                className="w-72 rounded-xl border border-slate-300 py-2 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-2"
            >
              <option value="all">
                All Time
              </option>
              <option value="today">
                Today
              </option>
              <option value="week">
                This Week
              </option>
              <option value="month">
                This Month
              </option>
              <option value="year">
                This Year
              </option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>

            <button
              onClick={deleteByFilter}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              <Filter className="h-4 w-4" />
              Delete {dateFilter}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                  />
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Search Keyword
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Date
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Time
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold">
                  Results
                </th>

                <th className="px-4 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(
                        item.id
                      )}
                      onChange={() =>
                        toggleSelectRow(item.id)
                      }
                    />
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {item.keyword}
                  </td>

                  <td className="px-4 py-4">
                    {item.date}
                  </td>

                  <td className="px-4 py-4">
                    {item.time}
                  </td>

                  <td className="px-4 py-4">
                    {item.results}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() =>
                        deleteSingle(item.id)
                      }
                      className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {!paginatedData.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500"
                  >
                    No search logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-4 border-t p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Rows Per Page
            </span>

            <select
              value={pageSize}
              onChange={(e) =>
                setPageSize(Number(e.target.value))
              }
              className="rounded-lg border px-3 py-2"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              className="rounded-lg border p-2 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="rounded-lg border p-2 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FUTURE API NOTE */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-700">
        Later connect this component with NestJS APIs
        to fetch search logs, filter by date range,
        export CSV/Excel, and bulk delete records.
      </div>
    </div>
  );
}