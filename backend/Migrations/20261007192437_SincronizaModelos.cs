using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EloDeCuidado.Migrations
{
    /// <inheritdoc />
    public partial class SincronizaModelos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Workspaces",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Workspaces");
        }
    }
}
