import { useState, useEffect } from "react";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import AddColModal from "./components/addColModal";
import SaveModal from "./components/saveModal";
import { incomeFormat } from "./components/utils";
import "./App.css";

import DeleteModal from "./components/deleteModal";
import Button from "@mui/material/Button";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { Typography } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface Report {
  ID: string;
  EMPNUM: number;
  NAME: string;
}

interface ReportsInfo {
  empSettings: Array<object>;
  reports: Array<Report>;
}

export interface Col {
  GROUP: string;
  ID: string | undefined;
  LOC: number | undefined;
  REPORTID: number | undefined;
  TEAM: string;
}

export interface Group {
  groupName: string;
  groupCode: string;
  teams: Array<string>;
}

export interface Groups {
  "30": Group;
  "40": Group;
  "60": Group;
  "70": Group;
  OH: Group;
  consolidated: Group;
  keys: Array<string>;
}

function App() {
  const [cols, setCols] = useState<Array<Col>>([]);
  const [lineItems, setLineitems] = useState<any>({
    keys: [],
    displayOrder: [],
  });

  const [modalIsOpen, setIsOpen] = useState(false);

  const [showSaveModal, setShowSave] = useState(false);

  const [selectedReport, setSelectedReport] = useState("newReport");
  const [selectedReportName, setSelectedReportName] = useState("");
  const [update, setUpdate] = useState(false);
  const [newCol, setNewCol] = useState<Col | void>();

  const [year, setYear] = useState("2023");
  const [startperiod, setStartPeriod] = useState("01");
  const [endPeriod, setEndPeriod] = useState("08");
  const [maxPerAv, setMaxPerAv] = useState("12");
  // this one controls what is the released period.
  const [maxPeriod, setMaxPeriod] = useState("12");
  const [maxYear, setMaxYear] = useState('2023');
  const [yearOpts, setYearOpts] = useState<number[]>([]);
  const [repType, setRepType] = useState("actuals");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [edM, setEdM] = useState(false);

  const [groups, setGroups] = useState<Groups | any>({ keys: [] });
  const [teams, setTeams] = useState<object | any>({ keys: [] });
  const [reportsInfo, setReportsInfo] = useState({
    empSettings: [],
    reports: [],
  } as ReportsInfo);

  //controls children table hidden state.
  const [childrenTables, setChildrenTables] = useState<object | any>({
    netrevanue: false,
    otherexpenses: false,
  });

  //controls if on new rep or old rep
  const [newRep, setNewRep] = useState(true);

  const periodOptions = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const borderTopArr = [
    "peoplecosts",
    "indirect",
    "operating",
    "profit",
    "contribution",
    "netprofit",
  ];
  const borderBtmArr = ["netrevenue", "contribution", "netprofit"];
  const grayArr = [
    "105",
    "109",
    "118",
    "104",
    "9",
    "15",
    "107",
    "98",
    "88",
    "91",
    "108",
    "13",
    "95",
  ];
  const topSectionArr = [
    "multiplier",
    "chargeability",
    "multicharge",
    "percentcontribution",
    "percentoperating",
    "percentnetoperating",
  ];
  const tableHeaderTop = " tableheader borderTop";
  const tableHeaderBtm = " tableheader borderBottom";

  const years = ["2023", "2022", "2021", "2020"];
  let cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("MAPNICK3="))
    ?.split("=")[1];


  const handleChangeReport = (e: SelectChangeEvent<typeof selectedReport>) => {
    const selectedRep = e.target.value;
    setSelectedReport(selectedRep);
    if (selectedRep === "newReport") {
      setCols([]);
      resetLineItems();
      setSelectedReportName("");
    } else {
      let reportsArry = reportsInfo.reports;
      reportsArry = reportsArry.filter((r) => r.ID !== "newReport");
      setReportsInfo({ ...reportsInfo, reports: reportsArry });
      getCols(selectedRep);
      const repName = reportsInfo.reports.find(
        (el) => el.ID == selectedRep
      )?.NAME;
      setSelectedReportName(repName ? repName : "");
    }
  };

  // utility function to create the list of years 
  // 2020 to current released year
  const generateYears = (maxYear: string) => {
    const startYear = 2020;
    const endYearNumber = parseInt(maxYear);
    const yearArr = [];
    for (let i = endYearNumber; i > startYear; i--) {
      yearArr.push(i);
    }
    return yearArr;
  };

  const handleNewReport = () => {
    const reportsArr = reportsInfo.reports;
    reportsArr.push({ ID: "newReport", EMPNUM: 0, NAME: "*New Report" });
    setReportsInfo({ ...reportsInfo, reports: reportsArr });
    setCols([]);
    resetLineItems();
    setYear("2023");
    setStartPeriod("01");
    setEndPeriod("08");
    setRepType("actuals");
    setSelectedReportName("");
    setSelectedReport("newReport");
    setEdM(true);
  };

  const getCols = async (repId: string, init: boolean = false) => {
    fetch(`${import.meta.env.VITE_API_LOC}/getCols`, {
      method: "post",
      body: JSON.stringify({
        reportId: repId,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCols(data.data);
        resetLineItems();
        if (init) {
          handleRunReport(data.data);
        }
      });
  };

  useEffect(() => {
    initApp();
  }, []);

  //run at start of app.
  const initApp = async () => {
    fetch(`${import.meta.env.VITE_API_LOC}/init`, {
      method: "post",
      body: JSON.stringify({ empNum: cookieValue }),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        const { TEAMS, GROUPS, REPORTSINFO, LINEITEMS, PERIOD } = data.data;
        setTeams(TEAMS);
        setGroups(GROUPS);

        setReportsInfo(REPORTSINFO);
        setLineitems(LINEITEMS);

        if (REPORTSINFO?.empSettings.length > 0) {
          setSelectedReport(REPORTSINFO.empSettings[0].LASTSELECTED);
          setYear(REPORTSINFO.empSettings[0].YEAR);
          setStartPeriod(REPORTSINFO.empSettings[0].START);
          setEndPeriod(REPORTSINFO.empSettings[0].END);
          setRepType(REPORTSINFO.empSettings[0].REPTYPE);
        } else if (REPORTSINFO?.reports.length > 0) {
          setSelectedReport(REPORTSINFO.reports[0].ID);
          getCols(REPORTSINFO.reports[0].ID, false);
        } else {
          handleAddCol();
          setEdM(true);
        }

        if (PERIOD.YEAR && PERIOD.PERIOD) {
          let yearArr = generateYears(PERIOD.YEAR);
          setMaxYear(PERIOD.YEAR);
          setYearOpts(yearArr);

          setMaxPeriod(PERIOD.PERIOD);

        } else {
          console.log("error with period: ", PERIOD);
        }

        if (REPORTSINFO && REPORTSINFO.cols && REPORTSINFO.cols.length > 0) {
          setCols(REPORTSINFO.cols);
        }
      });
  };
  //used on save to reset app and add new report to drop down.
  const resetApp = async () => {
    fetch(`${import.meta.env.VITE_API_LOC}/init`, {
      method: "post",
      body: JSON.stringify({ empNum: cookieValue }),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        const { REPORTSINFO } = data.data;
        setReportsInfo(REPORTSINFO);
        resetLineItems();
      });
  };

  useEffect(() => {
    if (year === maxYear && repType !== "budget") {
      setMaxPerAv(maxPeriod);
      setStartPeriod("01");
      setEndPeriod(maxPeriod);
    } else {
      setMaxPerAv("12");
      setEndPeriod("12");
      setStartPeriod("01");
    }
  }, [year, repType, maxYear, maxPeriod]);

  // controls if new report or not
  useEffect(() => {
    if (selectedReport !== "newReport") {
      setNewRep(false);
    } else {
      setNewRep(true);
    }
  }, [selectedReport]);

  const handleAddCol = () => {
    setIsOpen(true);
  };

  const handleOpenSaveModal = () => {
    setShowSave(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setShowSave(false);
  };

  const saveCol = (selected: Col, update: boolean) => {
    if (newRep) {
      if (edM && newCol?.ID) {
        const idx = parseInt(newCol.ID);

        cols[idx] = selected;
      } else {
        selected.ID = `${cols.length}`;
        setCols([...cols, selected]);
      }
    } else if (update) {
      const newC: Col = {
        ID: newCol?.ID,
        REPORTID: newCol?.REPORTID,
        LOC: newCol?.LOC,
        TEAM: selected.TEAM,
        GROUP: selected.GROUP,
      };
      handleUpdateCol(newC);
    } else {
      fetch(`${import.meta.env.VITE_API_LOC}/addcol`, {
        method: "POST",
        body: JSON.stringify({
          reportId: selectedReport,
          col: {
            loc: cols.length + 1,
            TEAM: selected.TEAM,
            GROUP: selected.GROUP,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data.success) {
            getCols(selectedReport);
          } else {
            console.log(data.data);
          }
        });
    }
    resetLineItems();
  };

  //controls the drop downs
  const handleChangeYear = (e: SelectChangeEvent<typeof year>) => {
    const year = e.target.value;
    setYear(year);
    resetLineItems();
  };
  const handleChangeStartPeriod = (
    e: SelectChangeEvent<typeof startperiod>
  ) => {
    const period = e.target.value;
    setStartPeriod(period);
    resetLineItems();
  };
  const handleChangeEndPeriod = (e: SelectChangeEvent<typeof endPeriod>) => {
    const period = e.target.value;
    setEndPeriod(period);
    resetLineItems();
  };

  const handleRunReport = (newCols: Array<object> | null) => {
    const selectedCols = cols.length > 0 ? cols : newCols;
    setChildrenTables({});
    if (selectedCols && selectedCols.length > 0) {
      fetch(`${import.meta.env.VITE_API_LOC}/getReport`, {
        method: "POST",
        body: JSON.stringify({
          cols: selectedCols,
          year: year,
          startperiod: startperiod,
          endperiod: endPeriod,
          reportId: selectedReport,
          repType: repType,
          empNum: cookieValue,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setLineitems(data.data);
        });
    }
  };

  const handleDeleteReport = () => {
    fetch(`${import.meta.env.VITE_API_LOC}/deleteReport`, {
      method: "POST",
      body: JSON.stringify({
        reportId: selectedReport,
        empNum: cookieValue,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let repsArr = [];
        if (data.data.reports?.length > 0) {
          repsArr = [
            ...data.data.reports,
            { ID: "newReport", EMPNUM: 0, NAME: "*New Report" },
          ];
        } else {
          repsArr = [{ ID: "newReport", EMPNUM: 0, NAME: "*New Report" }];
        }
        setReportsInfo({ ...reportsInfo, reports: repsArr });
        setCols([]);
        resetLineItems();
        setSelectedReportName("");
        setSelectedReport("newReport");
        setShowDeleteModal(false);
      });
  };

  const resetLineItems = () => {
    fetch(`${import.meta.env.VITE_API_LOC}/getlineitemnames`, {
      method: "POST",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setLineitems(data.data);
      });
  };

  const handleUpdateReportName = (rName: string) => {
    fetch(`${import.meta.env.VITE_API_LOC}/updateReportname`, {
      method: "POST",
      body: JSON.stringify({
        reportId: selectedReport,
        newName: rName,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        initApp();
        closeModal();
      });
  };

  const deleteCol = (id: string) => {
    if (selectedReport !== "newReport") {
      fetch(`${import.meta.env.VITE_API_LOC}/deleteCol`, {
        method: "POST",
        body: JSON.stringify({
          reportId: selectedReport,
          colId: id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setCols(data.data);
        });
      resetLineItems();
    } else {
      setCols(cols.filter((itm, idx) => idx !== parseInt(id)));
    }
  };

  const handleSave = () => {
    if (newRep) {
      fetch(`${import.meta.env.VITE_API_LOC}/save`, {
        method: "post",
        body: JSON.stringify({
          empNum: cookieValue,
          reportName: selectedReportName,
          cols: cols,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (data.data.success) {
            setSelectedReport(data.data.rId);
            setEdM(false);
            resetApp();
            closeModal();
          } else {
            console.log("something went wrong");
            console.log(data);
          }
        });
    } else {
      handleUpdateReportName(selectedReportName);
    }
  };

  const handleUpdateCol = (col: Col) => {
    fetch(`${import.meta.env.VITE_API_LOC}/updatecol`, {
      method: "POST",
      body: JSON.stringify({
        col: col,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCols(data.data);
        setNewCol();
        setUpdate(false);
      });
  };

  //controls children show
  const handleShowChildren = (e: React.FormEvent<HTMLButtonElement>) => {
    const target = e.currentTarget.value;
    const newValue = !childrenTables[target];
    setChildrenTables({ ...childrenTables, [target]: newValue });
  };

  const handleDownloadReport = () => {
    const link = document.createElement("a");
    link.target = "_blank";
    link.download = "customCombining-spreadsheet.xls";
    fetch(`${import.meta.env.VITE_API_LOC}/download`, {
      method: "POST",
      body: JSON.stringify({
        cols: cols,
        year: year,
        startperiod: startperiod,
        endperiod: endPeriod,
        reportId: selectedReport,
        repType: repType,
        empNum: cookieValue,
      }),
    })
      .then((res) => res.blob())
      .then((data) => {
        link.href = URL.createObjectURL(
          new Blob([data], { type: "application/msexcel" })
        );
        link.click();
      });
  };

  const buttonSX = {
    backgroundColor: "secondary.main",
    "&:hover": {
      backgroundColor: "secondary.dark",
    },
  };

  const switchSX = {
    "& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track": {
      backgroundColor: "secondary.light",
    },
  };

  return (
    <div id="#root" className="mx-auto m-2 mainContainer">
      <div className="flex justify-end">
        <div className=" controlBtn">
          {selectedReport !== "newReport" && cols.length > 0 ? (
            <Button
              variant="contained"
              className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect tertiary "
            >
              <a
                onClick={handleDownloadReport}
                className="blackText"
                target="_blank"
              >
                Export to Excel
              </a>
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="flex flex-row actionBarWrapper">
        <Typography
          className="text-left w-full align-vertical p-1"
          variant="h3"
          sx={{ color: "text.secondary" }}
        >
          Custom Combining
        </Typography>
        <div className="flex flex-row-reverse w-full items-end p-1 actionBar">
          {newRep ? (
            <Button
              variant="contained"
              className="controlButtons"
              disabled={cols.length > 0 ? false : true}
              onClick={handleOpenSaveModal}
            >
              Save
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                disabled={edM}
                className="controlButtons"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
              <Button
                disableFocusRipple={true}
                variant="contained"
                disabled={edM}
                className="controlButtons"
                onClick={handleOpenSaveModal}
              >
                rename
              </Button>
              <Button
                variant="contained"
                disabled={edM}
                id="addColBtn"
                className="controlButtons m-2 material-icons"
                onClick={handleNewReport}
              >
                New
              </Button>
            </>
          )}
          <Button
            variant="contained"
            disabled={!edM}
            id="addColBtn"
            className="controlButtons m-2 material-icons"
            onClick={handleAddCol}
            sx={buttonSX}
          >
            Add Column
          </Button>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={edM}
                  sx={switchSX}
                  onClick={() => setEdM(!edM)}
                />
              }
              label="EDIT COLUMN"
            />
          </FormGroup>
        </div>
      </div>
      <section className="pt-2 filterBarWrapper">
        <div className="flex flex-wrap flex-row-reverse items-end p-2 titleBar">
          <Button
            variant="contained"
            className="mx-1 runBtn"
            disabled={cols.length > 0 ? edM : true}
            onClick={() => handleRunReport([])}
          >
            Run
          </Button>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="report-type-controlled-label">
              Report Type
            </InputLabel>
            <Select
              labelId="report-type-controlled-label"
              label="Report Type"
              value={repType}
              onChange={(e) => {
                setRepType(e.target.value);
                resetLineItems();
              }}
              disabled={edM}
              IconComponent={KeyboardArrowDown}
            >
              <MenuItem value="actuals">Actual</MenuItem>
              <MenuItem value="budget">Plan</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="end-controlled-label">End Period</InputLabel>
            <Select
              labelId="end-controlled-label"
              label="End Period"
              value={endPeriod}
              onChange={handleChangeEndPeriod}
              disabled={edM}
              IconComponent={KeyboardArrowDown}
            >
              {periodOptions
                .filter((p) => p >= startperiod && p <= maxPerAv)
                .map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="start-controlled-label">Start Period</InputLabel>
            <Select
              labelId="start-controlled-label"
              label="Start Period"
              value={startperiod}
              onChange={handleChangeStartPeriod}
              disabled={edM}
              IconComponent={KeyboardArrowDown}
            >
              {periodOptions
                .filter((p) => p <= endPeriod)
                .map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="year-controlled-label">Year</InputLabel>
            <Select
              labelId="year-controlled-label"
              label="Year"
              value={year}
              onChange={handleChangeYear}
              disabled={edM}
              IconComponent={KeyboardArrowDown}
            >
              {yearOpts.map((y: number) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="myreports-controlled-label">My Reports</InputLabel>
            <Select
              labelId="myreports-controlled-label"
              label="My Reports"
              value={selectedReport}
              onChange={handleChangeReport}
              disabled={edM}
              IconComponent={KeyboardArrowDown}
            >
              {reportsInfo.reports.map((rep) => (
                <MenuItem key={rep.ID} value={rep.ID}>
                  {rep.NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </section>
      <main className="mainTable shadow-2xl">
        <section className="pt-2 titleBarWrapper">
          <div className="flex flex-row titleBarHeadingWrapper">
            <div className="titleBarHeading table-name nameCol">
              <h4 className="text-xl font-normal text-left text-black py-2 "></h4>
            </div>
            <div className="text-right font-normal titleBarSelect">
              {cols.map((col, idx) => (
                <div className="flex flex-col headerCell px-0" key={idx}>
                  {edM ? (
                    <div className="editMode">
                      <button
                        value={idx}
                        onClick={(e) => {
                          const idx: number = parseInt(e.currentTarget.value);
                          const col = cols[idx];

                          setNewCol(col);
                          setUpdate(true);
                          handleAddCol();
                        }}
                      >
                        <Edit className="material-icons editBtn mx-1" />
                      </button>
                      <button
                        value={col.ID}
                        onClick={(e) => {
                          const id = e.currentTarget.value;
                          deleteCol(id);
                        }}
                      >
                        <Delete color="error" />
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="headerTitle">
                    <div
                      className={`${groups[col.GROUP].groupName == "PM/CM"
                        ? "PM p-2 bold"
                        : groups[col.GROUP].groupName
                        } p-2 bold othercol`}
                    >
                      {groups[col.GROUP].groupName}
                    </div>
                    {col.TEAM === "all" ? (
                      <div className="px-3">All</div>
                    ) : (
                      <Typography className="px-2">
                        {teams[col.TEAM].shortName}
                      </Typography>
                    )}
                  </div>
                </div>
              ))}
              <div
                className={`flex flex-col headerCell px-0 ${edM ? "editmode" : ""
                  }`}
              >
                <div className="headerTitle">
                  <div className="p-2 bold total">Total</div>
                  <div className="px-3">All</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="main">
          {lineItems.displayOrder.map((l: string, idx: number) => {
            if (
              lineItems[l] &&
              l !== "spacer" &&
              l !== "spacerLineBot" &&
              l !== "spacerLineTop"
            ) {
              return (
                <>
                  <div
                    key={idx}
                    className={
                      "flex flex-row " +
                      (borderTopArr.includes(l) ? tableHeaderTop : "") +
                      (topSectionArr.includes(l) ? "topSection gray" : "") +
                      (grayArr.includes(l) ? "gray" : " white") +
                      (borderBtmArr.includes(l) && !childrenTables[l]
                        ? tableHeaderBtm
                        : "") +
                      (childrenTables[l] && l !== "otherexpenses"
                        ? " tableheader"
                        : "")
                    }
                  >
                    {idx < 7 && idx !== 2 ? (
                      <div
                        title={lineItems[l].description}
                        className={"table-name nameCol"}
                      >
                        {lineItems[l] ? lineItems[l].name : ""}
                      </div>
                    ) : (
                      <div className={"table-name nameCol"}>
                        {lineItems[l].children.length > 0 ? (
                          <button
                            value={lineItems[l].code}
                            onClick={(e) => handleShowChildren(e)}
                          >
                            <KeyboardArrowDown
                              className={
                                childrenTables[l] ? " show" : " hidden"
                              }
                            />
                            <KeyboardArrowRight
                              className={
                                childrenTables[l] ? " hidden" : " show"
                              }
                            />
                          </button>
                        ) : (
                          ""
                        )}
                        {lineItems[l] ? lineItems[l].name : ""}
                      </div>
                    )}
                    <div className="flex flex-row ">
                      {lineItems[l].groups ? (
                        lineItems[l].groups.length > 0 ? (
                          lineItems[l].groups.map((g: any, gIdx: number) => (
                            <div key={gIdx} className="px-3 headerCell">
                              {(g.total >= 1 || g.total <= -1) &&
                                idx > 7 &&
                                !lineItems[l].header &&
                                lineItems[l].children.length === 0 ? (
                                <a
                                  className="drillDownLink"
                                  href={`../customCombiningDD.cfm?year=${year}&startperiod=${startperiod}&endperiod=${endPeriod}&reporttype=${repType}&repid=${selectedReport}&empnum=${cookieValue}&lineitemcode=${lineItems[l].code}`}
                                >
                                  <p className="text-right">
                                    {incomeFormat(g.total, lineItems[l].type)}
                                  </p>
                                </a>
                              ) : (
                                <p className="text-right">
                                  {incomeFormat(g.total, lineItems[l].type)}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          cols.map((col, idx) => (
                            <div key={idx} className="px-3 headerCell">
                              <p className="text-right">-</p>
                            </div>
                          ))
                        )
                      ) : (
                        <></>
                      )}
                      <div className="px-3 headerCell">
                        <p className="text-right">
                          {incomeFormat(lineItems[l].total, lineItems[l].type)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {lineItems[l].children.length > 0 ? (
                    <>
                      {lineItems[l].children.map((c: string, idx: number) => (
                        <div
                          className={
                            "flex flex-row childrenTable" +
                            (grayArr.includes(`${c}`) ? " gray" : " white") +
                            (childrenTables[l] ? " show" : " hidden") +
                            (c == "88" ? " borderBottom" : "")
                          }
                          key={idx}
                        >
                          <div className="table-name childrenName">
                            {lineItems[c] ? lineItems[c].name : ""}
                          </div>
                          <div className="flex flex-row">
                            {lineItems[c] ? (
                              lineItems[c].groups.map(
                                (cg: any, gIdx: number) => (
                                  <div key={gIdx} className="px-3 headerCell">
                                    {cg.total >= 1 || cg.total <= -1 ? (
                                      <a
                                        className="drillDownLink"
                                        href={`../customCombiningDD.cfm?year=${year}&startperiod=${startperiod}&endperiod=${endPeriod}&reporttype=${repType}&repid=${selectedReport}&empnum=${cookieValue}&lineitemcode=${lineItems[c].code}`}
                                      >
                                        <p className="text-right">
                                          {incomeFormat(
                                            cg.total,
                                            lineItems[c].type
                                          )}
                                        </p>
                                      </a>
                                    ) : (
                                      <p className="text-right">
                                        {incomeFormat(
                                          cg.total,
                                          lineItems[c].type
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )
                              )
                            ) : (
                              <></>
                            )}
                            {lineItems[c]?.total ? (
                              <div className="px-3 headerCell">
                                <p className="text-right">
                                  {incomeFormat(
                                    lineItems[c].total,
                                    lineItems[c].type
                                  )}
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              );
            }
          })}
        </section>
      </main>
      <AddColModal
        open={modalIsOpen}
        close={closeModal}
        update={update}
        teams={teams}
        groups={groups}
        handleSelect={saveCol}
      ></AddColModal>
      <SaveModal
        open={showSaveModal}
        close={closeModal}
        cols={cols}
        handleSave={handleSave}
        reportName={selectedReportName}
        setReportName={setSelectedReportName}
      ></SaveModal>
      <DeleteModal
        open={showDeleteModal}
        close={() => setShowDeleteModal(false)}
        handleDelete={handleDeleteReport}
      ></DeleteModal>
    </div>
  );
}

export default App;
