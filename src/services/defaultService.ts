import { DataSource, Repository } from 'typeorm';
import { Region } from '../entities/region.entity.js';
import { HomeTown } from '../entities/hometown.entity.js';

export class DefaultService{
    private regionRepository: Repository<Region>;
    private hometownRepository: Repository<HomeTown>;
    constructor(dataSource: DataSource) {
        this.regionRepository = dataSource.getRepository(Region);
        this.hometownRepository = dataSource.getRepository(HomeTown);
    }
    public getRegionById = async (id: number) => await this.regionRepository.findOne({ where: { id }});
    public getHometownById = async (id: number) => await this.hometownRepository.findOne({ where: { id }});
}