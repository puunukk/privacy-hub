package services

import (
	"strconv"
	"strings"
	"syscall"

	"privacy-hub-backend/internal/models"
	"privacy-hub-backend/internal/utils"
)

// StorageService handles storage information retrieval
type StorageService struct {
	platform *PlatformService
}

// NewStorageService creates a new storage service instance
func NewStorageService() *StorageService {
	return &StorageService{
		platform: NewPlatformService(),
	}
}

// GetStorageInfo returns comprehensive storage information
func (s *StorageService) GetStorageInfo() models.StorageInfo {
	info := models.StorageInfo{
		RootPartition:  s.getDiskUsage("/"),
		Partitions:     s.getAllPartitions(),
		StorageDevices: s.getStorageDevices(),
	}
	
	info.TotalDisks = len(info.StorageDevices)
	return info
}

// getDiskUsage returns disk usage statistics using syscall (efficient)
func (s *StorageService) getDiskUsage(path string) models.DiskInfo {
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return models.DiskInfo{}
	}
	
	total := int64(stat.Blocks) * int64(stat.Bsize)
	free := int64(stat.Bavail) * int64(stat.Bsize)
	used := total - free
	
	return models.DiskInfo{
		Total: total,
		Free:  free,
		Used:  used,
	}
}

// getAllPartitions reads /proc/mounts using platform detection
func (s *StorageService) getAllPartitions() map[string]models.DiskInfo {
	partitions := make(map[string]models.DiskInfo)
	
	mountsPath := s.platform.ResolvePath("proc", "mounts")
	if mountsPath == "" {
		return partitions
	}
	
	if data, err := utils.ReadFile(mountsPath); err == nil {
		lines := strings.Split(data, "\n")
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) < 3 {
				continue
			}
			
			device := fields[0]
			mountpoint := fields[1]
			fstype := fields[2]
			
			// Skip virtual filesystems and unwanted mounts
			if strings.HasPrefix(device, "/dev/") && 
			   !strings.Contains(mountpoint, "proc") &&
			   !strings.Contains(mountpoint, "sys") &&
			   !strings.Contains(mountpoint, "dev") &&
			   fstype != "tmpfs" && fstype != "devtmpfs" {
				
				partitions[mountpoint] = s.getDiskUsage(mountpoint)
			}
		}
	}
	
	return partitions
}

// getStorageDevices reads storage device information using platform detection
func (s *StorageService) getStorageDevices() []models.StorageDevice {
	var devices []models.StorageDevice
	
	partitionsPath := s.platform.ResolvePath("proc", "partitions")
	if partitionsPath == "" {
		return devices
	}
	
	if data, err := utils.ReadFile(partitionsPath); err == nil {
		lines := strings.Split(data, "\n")
		for i, line := range lines {
			if i < 2 { // Skip header lines
				continue
			}
			
			fields := strings.Fields(line)
			if len(fields) < 4 {
				continue
			}
			
			name := fields[3]
			blocksStr := fields[2]
			
			// Skip partition numbers (only get main devices)
			if strings.ContainsAny(name[len(name)-1:], "0123456789") {
				continue
			}
			
			blocks, err := strconv.ParseInt(blocksStr, 10, 64)
			if err != nil {
				continue
			}
			
			size := blocks * 1024 // Convert from 1K blocks to bytes
			deviceType := s.getDeviceType(name)
			mountpoint := s.findMountpoint(name)
			
			devices = append(devices, models.StorageDevice{
				Name:       name,
				Size:       size,
				Type:       deviceType,
				Mountpoint: mountpoint,
			})
		}
	}
	
	return devices
}

// getDeviceType determines the type of storage device based on name and platform
func (s *StorageService) getDeviceType(name string) string {
	// Get platform info for better device type detection
	platformInfo := s.platform.GetPlatformInfo()
	
	switch {
	case strings.HasPrefix(name, "mmcblk"):
		// More specific detection for different ARM platforms
		if platformInfo.Architecture == "arm" || platformInfo.Architecture == "arm64" {
			return "SD/MMC (ARM)"
		}
		return "SD/MMC"
		
	case strings.HasPrefix(name, "nvme"):
		return "NVMe SSD"
		
	case strings.HasPrefix(name, "sd"):
		// Could be SATA, USB, or SCSI - try to be more specific
		return "SATA/USB/SCSI"
		
	case strings.HasPrefix(name, "hd"):
		return "IDE/PATA"
		
	case strings.HasPrefix(name, "vd"):
		return "Virtual Disk"
		
	case strings.HasPrefix(name, "xvd"):
		return "Xen Virtual Disk"
		
	case strings.HasPrefix(name, "loop"):
		return "Loop Device"
		
	default:
		return "Unknown"
	}
}

// findMountpoint finds where a device is mounted using platform detection
func (s *StorageService) findMountpoint(deviceName string) string {
	mountsPath := s.platform.ResolvePath("proc", "mounts")
	if mountsPath == "" {
		return ""
	}
	
	if data, err := utils.ReadFile(mountsPath); err == nil {
		lines := strings.Split(data, "\n")
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				device := fields[0]
				mountpoint := fields[1]
				
				if strings.Contains(device, deviceName) {
					return mountpoint
				}
			}
		}
	}
	
	return ""
}