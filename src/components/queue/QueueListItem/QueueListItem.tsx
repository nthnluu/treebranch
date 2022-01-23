import React, {FC, useEffect, useState} from "react";
import {Avatar, Box, Chip, Paper, Stack, Typography} from "@mui/material";
import IconButton from "@components/shared/IconButton";
import CheckIcon from '@mui/icons-material/Check';
import QueueAPI, {Ticket, TicketStatus} from "@util/queue/api";
import {useAuth} from "@util/auth/hooks";
import EditTicketDialog from "@components/queue/EditTicketDialog";
import getInitials from "@util/shared/getInitials";
import QueueListItemMenu from "@components/queue/QueueListItemMenu";
import {toast} from "react-hot-toast";
import QueueListItemTimer from "@components/queue/QueueListItemTimer";
import errors from "@util/errors";

export interface QueueListItemProps {
    courseID: string;
    queueID: string;
    ticket: Ticket;
}

const QueueListItem: FC<QueueListItemProps> = ({courseID, queueID, ticket}) => {
    const {currentUser} = useAuth();
    const [editTicketDialog, setEditTicketDialog] = useState(false);

    const isClaimed = ticket.status === TicketStatus.StatusClaimed;
    const isMissing = ticket.status === TicketStatus.StatusMissing;
    const isCompleted = ticket.status === TicketStatus.StatusComplete;

    const isTA = (currentUser != undefined) && (currentUser.coursePermissions[courseID] != undefined);
    const isTicketOwner = (currentUser != undefined) && (ticket.createdBy.Email === currentUser.email);

    function handleClaimTicket() {
        QueueAPI.editTicket(ticket.id, queueID, TicketStatus.StatusClaimed, ticket.description)
            .catch(() => toast.error(errors.UNKNOWN));
    }

    // send desktop notification to user when their ticket is claimed
    useEffect(() => {
        if (isTicketOwner && isClaimed) {
            new Notification('Your ticket has been claimed!');
        }
    }, [isClaimed, isTicketOwner]);

    return (<>
        <EditTicketDialog open={editTicketDialog} onClose={() => setEditTicketDialog(false)} ticket={ticket}
                          queueID={queueID as string}/>
        <Paper variant="outlined">
            <Box p={2.5}>
                <Stack direction="row" justifyContent="space-between" overflow={"hidden"}>
                    <Stack direction="row" spacing={2} alignItems="center" overflow={"hidden"}>
                        <Avatar src={ticket.createdBy.PhotoURL} imgProps={{referrerPolicy: "no-referrer"}}
                                sx={{display: ["none", null, "flex"]}}>
                            {getInitials(ticket.createdBy.DisplayName)}
                        </Avatar>
                        <Box overflow={"hidden"}>
                            <Stack direction="row" spacing={1}>
                                <Box>
                                    <Typography fontSize={16} fontWeight={600}>
                                        {ticket.createdBy.DisplayName}
                                    </Typography>
                                </Box>
                                {isClaimed && ticket.claimedAt && <QueueListItemTimer claimedAt={ticket.claimedAt}/>}
                                {isMissing && <Chip label="Missing" size="small" color="error" sx={{fontWeight: 500}}/>}
                                {isCompleted &&
                                    <Chip label="Completed" size="small" color="info" sx={{fontWeight: 500}}/>}
                            </Stack>
                            <Typography sx={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
                                        fontSize={14}>{ticket.description}</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={0} alignItems="center">
                        {isTA && !isClaimed && !isCompleted && <IconButton label="Claim ticket"
                                                                           onClick={handleClaimTicket}>
                            <CheckIcon/>
                        </IconButton>}
                        {(isTA || isTicketOwner) &&
                            <QueueListItemMenu isClaimed={isClaimed} isTA={isTA} isTicketOwner={isTicketOwner}
                                               queueID={queueID} ticket={ticket}
                                               setEditTicketDialog={setEditTicketDialog}/>}
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    </>);
};

export default QueueListItem;


