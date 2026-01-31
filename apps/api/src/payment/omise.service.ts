import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import omise from 'omise';

@Injectable()
export class OmiseService {
    private omiseClient: any;
    private readonly logger = new Logger(OmiseService.name);

    constructor(private configService: ConfigService) {
        const publicKey = this.configService.get<string>('OMISE_PUBLIC_KEY');
        const secretKey = this.configService.get<string>('OMISE_SECRET_KEY');

        if (!publicKey || !secretKey) {
            this.logger.warn('Omise keys are missing in configuration');
        }

        this.omiseClient = omise({
            publicKey: publicKey,
            secretKey: secretKey,
        });
    }

    async createCharge(amount: number, token: string, returnUri: string, metadata: any = {}) {
        try {
            // Omise expects amount in satang (THB x 100)
            return await this.omiseClient.charges.create({
                amount: amount * 100,
                currency: 'thb',
                card: token,
                return_uri: returnUri,
                metadata,
            });
        } catch (error) {
            this.logger.error('Failed to create charge', error);
            throw error;
        }
    }

    async createSource(amount: number, type: string = 'promptpay', metadata: any = {}) {
        try {
            return await this.omiseClient.sources.create({
                amount: amount * 100,
                currency: 'thb',
                type: type,
                metadata,
            });
        } catch (error) {
            this.logger.error('Failed to create source', error);
            throw error;
        }
    }

    async createChargeWithSource(amount: number, sourceId: string, returnUri: string, metadata: any = {}) {
        try {
            return await this.omiseClient.charges.create({
                amount: amount * 100,
                currency: 'thb',
                source: sourceId,
                return_uri: returnUri,
                metadata,
            });
        } catch (error) {
            this.logger.error('Failed to create charge with source', error);
            throw error;
        }
    }

    async retrieveCharge(chargeId: string) {
        try {
            return await this.omiseClient.charges.retrieve(chargeId);
        } catch (error) {
            this.logger.error('Failed to retrieve charge', error);
            throw error;
        }
    }
}
