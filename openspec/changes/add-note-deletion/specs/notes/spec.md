## ADDED Requirements

### Requirement: Note Deletion
Users SHALL be able to delete notes from the notes feed. Deletion MUST be confirmed before execution to prevent accidental data loss.

#### Scenario: User deletes a note
- **WHEN** user clicks the delete button on a note card
- **THEN** a confirmation dialog is displayed asking to confirm deletion

#### Scenario: User confirms deletion
- **WHEN** user confirms the deletion in the dialog
- **THEN** the note is permanently removed from storage
- **AND** the note disappears from the feed immediately

#### Scenario: User cancels deletion
- **WHEN** user cancels the deletion in the confirmation dialog
- **THEN** the note remains unchanged
- **AND** the dialog closes

### Requirement: Delete Button Visibility
The delete button SHALL be accessible on each note card without interfering with the primary click-to-edit interaction.

#### Scenario: Delete button on desktop
- **WHEN** user hovers over a note card on desktop
- **THEN** the delete button becomes visible

#### Scenario: Delete button on mobile
- **WHEN** user views a note card on mobile
- **THEN** the delete button is always visible

#### Scenario: Delete button does not trigger navigation
- **WHEN** user clicks the delete button
- **THEN** the note editor does NOT open
- **AND** only the confirmation dialog appears
