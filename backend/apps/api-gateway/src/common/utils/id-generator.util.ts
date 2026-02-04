import { Repository } from 'typeorm';

export enum EntityCode {
    STUDENT = 'S',
    TEACHER = 'T',
    PARENT = 'P',
    CLASS = 'C',
    SUBJECT = 'B',
    EVALUATION = 'E',
    DOCUMENT = 'D',
    INVOICE = 'I',
    RECEIPT = 'R',
}

export class IdGenerator {
    private static readonly PREFIX = 'KSP';

    /**
     * Generates an academic year code like '2526' for 2025-2026.
     * If the current month is September or later, it assumes the start of a new academic year.
     */
    static getAcademicYearCode(date: Date = new Date()): string {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11 (Jan-Dec)

        let startYear: number;
        let endYear: number;

        // Assuming academic year starts in September (month index 8)
        if (month >= 8) {
            startYear = year;
            endYear = year + 1;
        } else {
            startYear = year - 1;
            endYear = year;
        }

        const startYearStr = startYear.toString().slice(-2);
        const endYearStr = endYear.toString().slice(-2);

        return `${startYearStr}${endYearStr}`;
    }

    /**
     * Formats the final ID string.
     */
    static formatId(
        entityCode: EntityCode,
        sequential: number,
        yearCode?: string,
        context?: string,
    ): string {
        const parts = [this.PREFIX, entityCode];
        if (context) {
            // Clean context (e.g., remove spaces, make uppercase)
            const cleanContext = context.replace(/\s+/g, '').toUpperCase();
            parts.push(cleanContext);
        }
        if (yearCode) {
            parts.push(yearCode);
        }
        parts.push(sequential.toString().padStart(3, '0'));

        return parts.join('-');
    }

    /**
     * Generic method to generate the next registration number for any repository.
     */
    static async generateNextId<T>(
        repository: Repository<T>,
        entityCode: EntityCode,
        yearCode?: string,
        context?: string,
    ): Promise<string> {
        let basePrefix = `${this.PREFIX}-${entityCode}-`;
        if (context) {
            basePrefix += `${context.replace(/\s+/g, '').toUpperCase()}-`;
        }
        if (yearCode) {
            basePrefix += `${yearCode}-`;
        }

        const lastRecord = await repository
            .createQueryBuilder('entity')
            .where('entity.registration_number LIKE :prefix', { prefix: `${basePrefix}%` })
            .orderBy('entity.registration_number', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastRecord) {
            const regNum = (lastRecord as any).registrationNumber || (lastRecord as any).registration_number;
            if (regNum) {
                const parts = regNum.split('-');
                const lastSeq = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(lastSeq)) {
                    nextNumber = lastSeq + 1;
                }
            }
        }

        return this.formatId(entityCode, nextNumber, yearCode, context);
    }
}
