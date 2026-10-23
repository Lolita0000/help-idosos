using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EloDeCuidado.Migrations
{
    /// <inheritdoc />
    public partial class AjustaEntradaDoDiario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "DiaryEntries");

            migrationBuilder.AddColumn<int>(
                name: "MoodLevel",
                table: "DiaryEntries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "DiaryEntries",
                type: "varchar(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MoodLevel",
                table: "DiaryEntries");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "DiaryEntries");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "DiaryEntries",
                type: "datetime(6)",
                nullable: true);
        }
    }
}
