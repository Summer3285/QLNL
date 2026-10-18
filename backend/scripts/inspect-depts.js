const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany({
    include: {
      manager: true,
      deputy: true,
      employees: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  const result = depts.map(d => ({
    code: d.code,
    name: d.name,
    budget: d.budget,
    location: d.location,
    manager: d.manager ? `${d.manager.fullName} (${d.manager.employeeCode})` : null,
    deputy: d.deputy ? `${d.deputy.fullName} (${d.deputy.employeeCode})` : null,
    count: d.employees.length,
    leadership: d.employees.filter(e => e.isCadre || e.cadreType !== 'STAFF').map(e => ({
      name: e.fullName,
      code: e.employeeCode,
      position: e.position,
      salary: e.baseSalary,
      allowance: e.allowance,
      cadreType: e.cadreType,
    })),
    staff: d.employees.filter(e => !e.isCadre && e.cadreType === 'STAFF').map(e => ({
      name: e.fullName,
      code: e.employeeCode,
      position: e.position,
      salary: e.baseSalary,
      allowance: e.allowance,
    })),
  }));

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
