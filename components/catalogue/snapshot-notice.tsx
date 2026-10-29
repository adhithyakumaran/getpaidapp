import {displayDate} from '@/src/modules/catalogue/model';
export function SnapshotNotice({capturedAt}:{capturedAt?:string}){
 if(!capturedAt)return null;
 return <p className="snapshot-notice" role="note">Saved listings from <time dateTime={capturedAt}>{displayDate(capturedAt)}</time>. Live updates are temporarily unavailable. These source-listed offers have not been freshly checked; confirm conditions at the source.</p>;
}
