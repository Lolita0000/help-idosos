using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EloDeCuidado.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaNomeDoUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder
                .AddColumn<string>(
                    name: "Name",
                    table: "Users",
                    type: "varchar(256)",
                    maxLength: 256,
                    nullable: false,
                    defaultValue: ""
                )
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Name", table: "Users");
        }
    }
}
