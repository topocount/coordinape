import React, { useMemo } from 'react';

import { makeStyles } from '@material-ui/core';

import { FormModal, FormTextField, ApeToggle } from 'components';
import AdminUserForm from 'forms/AdminUserForm';
import { useApiAdminCircle } from 'hooks';
import { useSelectedCircle } from 'recoilState/app';
import { assertDef } from 'utils/tools';

import { IUser } from 'types';

const useStyles = makeStyles(theme => ({
  modalBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  ethInput: {
    width: '100%',
    gridColumn: '1 / span 2',
  },
  helperBox: {
    height: 0,
  },
}));

export const AdminUserModal = ({
  user,
  onClose,
  open,
}: {
  user?: IUser;
  open: boolean;
  onClose: () => void;
}) => {
  const classes = useStyles();

  const { circle: selectedCircle, circleId } = useSelectedCircle();
  const { updateUser, createUser } = useApiAdminCircle(circleId);

  const source = useMemo(
    () => ({
      user: user,
      circle: assertDef(selectedCircle, 'Missing circle'),
    }),
    [user, selectedCircle]
  );

  return (
    <AdminUserForm.FormController
      source={source}
      hideFieldErrors
      submit={params =>
        (user ? updateUser(user.address, params) : createUser(params))
          .then(() => onClose())
          .catch(console.warn)
      }
    >
      {({
        fields: {
          non_giver: {
            value: nonGiverValue,
            onChange: nonGiverOnChange,
            ...non_giver
          },
          ...fields
        },
        errors,
        changedOutput,
        handleSubmit,
      }) => (
        <FormModal
          onClose={onClose}
          open={open}
          title={user ? `Edit ${user.name}` : 'Create User'}
          onSubmit={handleSubmit}
          submitDisabled={!changedOutput}
          errors={errors}
          size="small"
        >
          <div className={classes.twoColumn}>
            <FormTextField {...fields.name} label="Contributor Name" />
            <FormTextField
              {...fields.starting_tokens}
              type="number"
              label="Starting Tokens"
            />
            <FormTextField
              {...fields.address}
              label="Contributor ETH address"
              fullWidth
              className={classes.ethInput}
            />
            <ApeToggle {...fields.role} label="Are They Admin?" />
            <ApeToggle
              label="Can Give?"
              {...non_giver}
              onChange={v => nonGiverOnChange(!v)}
              value={!nonGiverValue}
            />
            <ApeToggle {...fields.fixed_non_receiver} label="Force Opted Out" />
            <ApeToggle
              label="Opted Out"
              {...fields.non_receiver}
              disabled={fields.fixed_non_receiver.value}
            />
          </div>
        </FormModal>
      )}
    </AdminUserForm.FormController>
  );
};

export default AdminUserModal;
