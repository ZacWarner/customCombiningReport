import "./addColModal.css";
import { useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { dialog } from "../utils";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

//declare the types.
interface Props {
  open: boolean;
  close: Function;
  teams: any;
  groups: any;
  handleSelect: Function;
  update: boolean;
}

export default function AddColModal({
  open,
  close,
  teams,
  groups,
  handleSelect,
  update,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState("consolidated");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const handleSelectGroup = (e: SelectChangeEvent<typeof selectedGroup>) => {
    const group = e.target.value;
    setSelectedGroup(group);
    setSelectedTeam("all");
  };

  const handleSelectTeam = (e: SelectChangeEvent<typeof selectedTeam>) => {
    const team = e.target.value;
    setSelectedTeam(team);
  };

  const handleAdd = () => {
    handleSelect(
      {
        TEAM: selectedTeam,
        GROUP: selectedGroup,
        ID: -1,
      },
      update
    );
    close();
  };

  console.log(groups);

  return (
    <Dialog open={open} onClose={(e, reason) => close()} sx={dialog}>
      <DialogTitle>{"Select Group / Team for Column"}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="group-controlled-label">Group</InputLabel>
            <Select
              labelId="group-controlled-label"
              label="Group"
              value={selectedGroup}
              onChange={handleSelectGroup}
              IconComponent={KeyboardArrowDown}
            >
              {groups.keys.map((g: string) => (
                <MenuItem key={g} value={g}>
                  {groups[g].groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }} id="team-form-control">
            <InputLabel id="team-controlled-label">Team</InputLabel>
            <Select
              labelId="team-controlled-label"
              label="Team"
              value={selectedTeam}
              onChange={handleSelectTeam}
              IconComponent={KeyboardArrowDown}
            >
              {groups[selectedGroup] ? (
                selectedGroup === "consolidated" ||
                selectedGroup === "groupsOh" ? (
                  groups[selectedGroup].teams.map((g: string) => (
                    <MenuItem key={g} value={g}>
                      {teams[g].teamName}
                    </MenuItem>
                  ))
                ) : (
                  groups[selectedGroup].teams.map((g: string) => (
                    <MenuItem key={g} value={g}>
                      {teams[g].shortName}
                    </MenuItem>
                  ))
                )
              ) : (
                <></>
              )}
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          className="bg-blue-500 text-white rounded-md p-2"
          onClick={handleAdd}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
