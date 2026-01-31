import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        const settings = await this.prisma.systemConfig.findMany();
        // Convert array to object for easier consumption { key: value }
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }

    async updateSettings(settings: Record<string, string>) {
        const updates = Object.entries(settings).map(([key, value]) =>
            this.prisma.systemConfig.upsert({
                where: { key },
                update: { value },
                create: { key, value, description: 'System setting' },
            })
        );

        await this.prisma.$transaction(updates);
        return this.getSettings();
    }
}
