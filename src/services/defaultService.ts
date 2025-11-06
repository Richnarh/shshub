import { DataSource, Repository } from 'typeorm';
import { Region } from '../entities/region.entity.js';
import { HomeTown } from '../entities/hometown.entity.js';
import { District } from '../entities/district.entity.js';

export class DefaultService{
    private regionRepository: Repository<Region>;
    private districtRepository: Repository<District>;
    constructor(dataSource: DataSource) {
        this.regionRepository = dataSource.getRepository(Region);
        this.districtRepository = dataSource.getRepository(District);
    }
    public getRegionById = async (id: number) => await this.regionRepository.findOne({ where: { id }});
    public getDistrictById = async (id: number) => await this.districtRepository.findOne({ where: { id }});
}