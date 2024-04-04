import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly configService: ConfigService,
  ) {}
  // 사용자 위치 정보 업데이트
  async updateLocation(
    user: User,
    locationData: { latitude: number; longitude: number },
  ) {
    const { latitude, longitude } = locationData;
    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${this.configService.get('KAKAO_API_KEY')}`,
          },
        },
      );

      const { address, road_address } = response.data.documents[0];
      const addressInfo = address || road_address;

      let userLocation = await this.locationRepository.findOne({
        where: { userId: user.id },
      });
      if (!userLocation) {
        userLocation = this.locationRepository.create({
          userId: user.id,
          latitude: latitude,
          longitude: longitude,
          address_name: addressInfo.address_name,
          region_1depth_name: addressInfo.region_1depth_name,
          region_2depth_name: addressInfo.region_2depth_name,
          region_3depth_name: addressInfo.region_3depth_name,
        });
        await this.locationRepository.save(userLocation);
      } else {
        userLocation.latitude = latitude;
        userLocation.longitude = longitude;
        userLocation.address_name = addressInfo.address_name;
        userLocation.region_1depth_name = addressInfo.region_1depth_name;
        userLocation.region_2depth_name = addressInfo.region_2depth_name;
        userLocation.region_3depth_name = addressInfo.region_3depth_name;

        await this.locationRepository.save(userLocation);

        return {
          latitude,
          longitude,
          address_name: addressInfo.address_name,
          message: '사용자 위치정보가 적용되었습니다.',
        };
      }
    } catch (error) {
      console.error('Error updating location:', error);
      return { message: '사용자 위치정보를 업데이트하는데 실패했습니다.' };
    }
  }
}