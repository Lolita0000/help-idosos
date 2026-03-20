using EloDeCuidado.Models;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<InviteCode> InviteCodes => Set<InviteCode>();
    public DbSet<DiaryEntry> DiaryEntries => Set<DiaryEntry>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<WorkspaceMember>()
            .HasIndex(wm => new { wm.WorkspaceId, wm.UserId })
            .IsUnique();

        modelBuilder.Entity<InviteCode>().HasIndex(ic => ic.Code).IsUnique();

        modelBuilder
            .Entity<WorkspaceMember>()
            .HasOne(wm => wm.Workspace)
            .WithMany(w => w.Members)
            .HasForeignKey(wm => wm.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<InviteCode>()
            .HasOne(ic => ic.Workspace)
            .WithMany(w => w.InviteCodes)
            .HasForeignKey(ic => ic.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<DiaryEntry>()
            .HasOne(de => de.Workspace)
            .WithMany(w => w.DiaryEntries)
            .HasForeignKey(de => de.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<AuditLog>()
            .HasOne(al => al.Workspace)
            .WithMany()
            .HasForeignKey(al => al.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<DiaryEntry>()
            .HasOne(de => de.Author)
            .WithMany()
            .HasForeignKey(de => de.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<WorkspaceMember>()
            .HasOne(wm => wm.User)
            .WithMany(u => u.Memberships)
            .HasForeignKey(wm => wm.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
