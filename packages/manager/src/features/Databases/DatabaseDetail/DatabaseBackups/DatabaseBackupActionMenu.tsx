import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { makeStyles } from 'src/components/core/styles';
import InlineAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}

const DatabaseBackupActionMenu: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { backup, onRestore, onDelete } = props;

  const actions = [
    {
      title: 'Restore',
      onClick: () => onRestore(backup.id),
    },
  ];

  // Prepend the Delete button only for manual backups
  if (backup.type === 'snapshot') {
    actions.unshift({
      title: 'Delete',
      onClick: () => onDelete(backup.id),
    });
  }

  return (
    <div className={classes.inlineActions}>
      {actions.map((thisAction) => (
        <InlineAction
          key={thisAction.title}
          actionText={thisAction.title}
          onClick={thisAction.onClick}
        />
      ))}
    </div>
  );
};

export default DatabaseBackupActionMenu;
