import { PcSogsJson } from './SplatLoader';
export declare function unpackPcSogs(json: PcSogsJson, extraFiles: Record<string, ArrayBuffer>): Promise<{
    packedArray: Uint32Array;
    numSplats: number;
    extra: Record<string, unknown>;
}>;
export declare function unpackPcSogsZip(fileBytes: Uint8Array): Promise<{
    packedArray: Uint32Array;
    numSplats: number;
    extra: Record<string, unknown>;
}>;
