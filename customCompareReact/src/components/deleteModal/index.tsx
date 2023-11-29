import './deleteModal.css';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import {dialog} from '../utils'

interface Props {
    open: boolean,
    close: Function,
    handleDelete: Function
}

export default function DeleteModal({ open, close, handleDelete }: Props) {

    return (
        <Dialog
            open={open}
            onClose={(e, reason) => close()}
            sx={dialog}
        >
            <DialogTitle>Are you sure you would like to delete this report?</DialogTitle>
            <div className='middleSpacing'></div>
            <DialogActions>
                <Button className='bg-blue-500 text-white rounded-md p-2 m-2' onClick={() => close()}>Cancel</Button>
                <Button className='bg-blue-500 text-white rounded-md p-2 m-2' onClick={() => handleDelete()}>DELETE</Button>
            </DialogActions>
        </Dialog>
    )
}