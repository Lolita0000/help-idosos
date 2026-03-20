namespace EloDeCuidado.Models;

public enum EntryLabel
{
    Medication,
    Mood,
    Symptom,
    Appointment,
    Note,
    Other,
}

public enum EntryStatus
{
    Active,
    Edited,
    Deleted,
}

public enum MemberRole
{
    Admin,
    Member,
}
