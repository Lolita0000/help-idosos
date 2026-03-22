using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EloDeCuidado.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase().Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "Users",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        Email = table
                            .Column<string>(type: "varchar(254)", maxLength: 254, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        PasswordHash = table
                            .Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Users", x => x.Id);
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "Workspaces",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        Name = table
                            .Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Workspaces", x => x.Id);
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "AuditLogs",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        WorkspaceId = table.Column<int>(type: "int", nullable: false),
                        UserId = table.Column<int>(type: "int", nullable: false),
                        Action = table
                            .Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Entity = table
                            .Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        EntityId = table.Column<int>(type: "int", nullable: false),
                        Timestamp = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_AuditLogs", x => x.Id);
                        table.ForeignKey(
                            name: "FK_AuditLogs_Users_UserId",
                            column: x => x.UserId,
                            principalTable: "Users",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Restrict
                        );
                        table.ForeignKey(
                            name: "FK_AuditLogs_Workspaces_WorkspaceId",
                            column: x => x.WorkspaceId,
                            principalTable: "Workspaces",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "DiaryEntries",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        WorkspaceId = table.Column<int>(type: "int", nullable: false),
                        AuthorId = table.Column<int>(type: "int", nullable: false),
                        Content = table
                            .Column<string>(
                                type: "varchar(10000)",
                                maxLength: 10000,
                                nullable: false
                            )
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Label = table.Column<int>(type: "int", nullable: false),
                        Status = table.Column<int>(type: "int", nullable: false),
                        EditedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                        DeletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                        CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_DiaryEntries", x => x.Id);
                        table.ForeignKey(
                            name: "FK_DiaryEntries_Users_AuthorId",
                            column: x => x.AuthorId,
                            principalTable: "Users",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Restrict
                        );
                        table.ForeignKey(
                            name: "FK_DiaryEntries_Workspaces_WorkspaceId",
                            column: x => x.WorkspaceId,
                            principalTable: "Workspaces",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "InviteCodes",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        WorkspaceId = table.Column<int>(type: "int", nullable: false),
                        Code = table
                            .Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        ExpiresAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_InviteCodes", x => x.Id);
                        table.ForeignKey(
                            name: "FK_InviteCodes_Workspaces_WorkspaceId",
                            column: x => x.WorkspaceId,
                            principalTable: "Workspaces",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "WorkspaceMembers",
                    columns: table => new
                    {
                        Id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        WorkspaceId = table.Column<int>(type: "int", nullable: false),
                        UserId = table.Column<int>(type: "int", nullable: false),
                        Role = table.Column<int>(type: "int", nullable: false),
                        IsSubject = table.Column<bool>(type: "tinyint(1)", nullable: false),
                        JoinedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_WorkspaceMembers", x => x.Id);
                        table.ForeignKey(
                            name: "FK_WorkspaceMembers_Users_UserId",
                            column: x => x.UserId,
                            principalTable: "Users",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Restrict
                        );
                        table.ForeignKey(
                            name: "FK_WorkspaceMembers_Workspaces_WorkspaceId",
                            column: x => x.WorkspaceId,
                            principalTable: "Workspaces",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_WorkspaceId",
                table: "AuditLogs",
                column: "WorkspaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_DiaryEntries_AuthorId",
                table: "DiaryEntries",
                column: "AuthorId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_DiaryEntries_WorkspaceId",
                table: "DiaryEntries",
                column: "WorkspaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_InviteCodes_Code",
                table: "InviteCodes",
                column: "Code",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_InviteCodes_WorkspaceId",
                table: "InviteCodes",
                column: "WorkspaceId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_UserId",
                table: "WorkspaceMembers",
                column: "UserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceMembers_WorkspaceId_UserId",
                table: "WorkspaceMembers",
                columns: new[] { "WorkspaceId", "UserId" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AuditLogs");

            migrationBuilder.DropTable(name: "DiaryEntries");

            migrationBuilder.DropTable(name: "InviteCodes");

            migrationBuilder.DropTable(name: "WorkspaceMembers");

            migrationBuilder.DropTable(name: "Users");

            migrationBuilder.DropTable(name: "Workspaces");
        }
    }
}
