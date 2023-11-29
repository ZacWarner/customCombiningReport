import './saveModal.css';

import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {dialog} from '../utils'


interface Props {
    open: boolean,
    close: Function,
    cols: Array<Object>,
    reportName?: string,
    setReportName: Function,
    handleSave: Function,
};

export default function SaveModal({ open, close, cols, reportName, setReportName, handleSave }: Props) {
    const buttonReady = "mt-2 bg-blue-500 text-white";
    const buttonDisabled = "mt-2 bg-blue-100 text-white";

    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (!cookieValue) {
        cookieValue = "32385"
    }

    const [disableButton, setDisableButton] = useState(true);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.currentTarget.value;

        setReportName(newName)
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
          handleSave()
        }
      }
    useEffect(() => {
        if (reportName && reportName.length > 0) {
            setDisableButton(false);
        }
        if(reportName === "") {
            setDisableButton(true);
        }
    }, [reportName])


    return (
        <Dialog
            open={open}
            onClose={(e, reason) => close()}
            sx={dialog}
        >{
                cols.length >= 1 ?
                    <>
                        <DialogTitle className="py-2">Name your report</DialogTitle>
                        <DialogContent>
                            <TextField sx={{ width: '100%' }} label="Report Name" variant="standard" value={reportName} onChange={handleChangeName} onKeyDown={handleKeyDown} />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                disabled={disableButton}
                                className={`${disableButton ? buttonDisabled : buttonReady} bg-blue-500 text-white rounded-md p-2 m-2 `}
                                onClick={() => {
                                    handleSave();
                                }}
                            >Save</Button>
                        </DialogActions>
                    </>
                    :
                    <DialogTitle>You need to add Groups/Teams to your report first</DialogTitle>
            }

        </Dialog>
    )
}