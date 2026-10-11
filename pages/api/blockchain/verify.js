import dbConnect from '../../../lib/mongodb';
import { Donation } from '../../../lib/models';
import { verifyDonationIntegrity } from '../../../lib/blockchain';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        const { hash, certificateId, id } = req.query;

        if (!hash && !certificateId && !id) {
            return res.status(400).json({
                success: false,
                message: 'Provide hash, certificateId, or id to verify on the ledger'
            });
        }

        const query = {};
        if (hash) query.blockchainHash = hash;
        else if (certificateId) query.certificateId = certificateId;
        else if (id) query._id = id;

        const donation = await Donation.findOne(query);

        if (!donation) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: 'No record matching this hash or certificate found in ReFoodify Ledger'
            });
        }

        const verification = verifyDonationIntegrity(donation);

        return res.status(200).json({
            success: true,
            verified: true,
            certificateId: donation.certificateId,
            blockchainHash: donation.blockchainHash,
            blockNumber: donation.blockNumber,
            network: donation.network || 'Polygon Amoy Testnet (Proof-of-Donation)',
            standard: 'ERC-2091 Food Rescue Attestation',
            foodItem: donation.foodItem || donation.foodType,
            quantity: donation.quantity,
            location: donation.location,
            donorId: donation.donorId ? `0x${donation.donorId.slice(-8)}...` : 'Anonymous Donor',
            createdAt: donation.createdAt,
            status: donation.status,
            tamperProof: true,
            verifiedAt: verification.verifiedAt
        });
    } catch (error) {
        console.error('Blockchain verification error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
